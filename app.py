import os
import uuid
import base64
import face_recognition
import numpy as np
from flask import Flask, request, jsonify, render_template
from PIL import Image
import io
import json
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Load known faces
knownFaces = {}
knownDataDir = "known_data"
knownFacesDir = os.path.join(knownDataDir, "known_faces")


def loadKnownFaces():
	for filename in os.listdir(knownDataDir):
		if filename.endswith(".json"):  #process JSON files
			json_path = os.path.join(knownDataDir, filename)

			# Load the JSON metadata
			with open(json_path, 'r') as json_file:
				metadata = json.load(json_file)
				first_name = metadata["firstName"]
				last_name = metadata["lastName"]
				full_name = f"{first_name} {last_name}"
				# Check if knownFaceFileDir is a list (for multiple images)
				face_image_paths = metadata["knownFaceFileDir"]

				if not isinstance(face_image_paths, list):
					face_image_paths = [face_image_paths]

				# Load and encode multiple faces for this person
				face_encodings = []
				for image_path in face_image_paths:
					face_image = face_recognition.load_image_file(image_path)
					face_encoding = face_recognition.face_encodings(face_image)[0]  # Assumes at least one face
					face_encodings.append(face_encoding)

				# Store the list of face encodings and metadata in knownFaces
				global knownFaces
				knownFaces[full_name] = {
					"encodings": face_encodings,
					"metadata": metadata  # Store additional metadata
				}


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/recognize', methods=['POST'])
def recognize_face():
	# if 'file' not in request.files:
	# 	return jsonify({"error": "No file part"}), 400
	#
	# file = request.files['file']
	# if file.filename == '':
	# 	return jsonify({"error": "No selected file"}), 400

	data = request.json.get('data')  # Extract base64 image data from JSON payload

	if not data:
		return jsonify({"error": "No base64-encoded data provided"}), 400

	try:
		# Step 1: Decode base64 string to bytes
		decoded_bytes = base64.b64decode(data)

		# Step 2: Convert bytes to uint8 array
		uint8_array = np.frombuffer(decoded_bytes, dtype=np.uint8)

		# Reshape the array to image dimensions (assuming it's a valid image)
		# You might need to adjust the shape based on your image size and channels
		image = uint8_array.reshape((300, 400, 4))

		# Step 3: Load the image from the numpy array using PIL
		# Convert numpy array to PIL Image
		pil_image = Image.fromarray(image)

		# # Convert PIL image to a format suitable for face_recognition (numpy array)
		# image_np = np.array(pil_image)

		# Create a BytesIO object to hold the PNG image data
		png_image = io.BytesIO()

		# Save the PIL image as PNG into the BytesIO object
		pil_image.save(png_image, format='PNG')

		# To access the raw PNG data, you need to seek back to the start of the BytesIO object
		png_image.seek(0)

		if png_image:
			# Read the image file
			image_bytes = png_image.read()
			image = face_recognition.load_image_file(io.BytesIO(image_bytes))

			# Find face locations and encodings
			face_locations = face_recognition.face_locations(image)
			face_encodings = face_recognition.face_encodings(image, face_locations)

			results = []
			for face_encoding in face_encodings:  # If multiple faces
				minAccuracy = 0.45
				best_match = None
				best_accuracy = 0

				# Compare current face encoding to known faces
				for person, data in knownFaces.items():
					# Compare the input face with all known encodings for this person
					matches = face_recognition.compare_faces(data["encodings"], face_encoding, tolerance=1 - minAccuracy)
					face_distances = face_recognition.face_distance(data["encodings"], face_encoding)
					best_match_index = np.argmin(face_distances)  # Best match for this person
					accuracy = 1 - face_distances[best_match_index]  # Higher means better match

					# If any match is found, pick the best accuracy
					if matches[best_match_index] and accuracy > best_accuracy:
						best_match = person
						best_accuracy = accuracy

				# Prepare the result for the best match found
				if best_match:
					metadata = knownFaces[best_match]["metadata"]
					result = {
						"name": best_match,
						"accuracy": best_accuracy,
						"firstName": metadata["firstName"],
						"lastName": metadata["lastName"],
						"companyInfo": metadata.get("companyInfo", "N/A"),
						"locationMet": metadata.get("locationMet", "Unknown")
					}
				else:
					result = {"name": "Unknown"}

				results.append(result)

			return jsonify({"recognized_faces": results})
	except Exception as e:
		return jsonify({"error": f"Error processing data: {str(e)}"}), 500


"""
API Endpoint: /add_person (POST)

Request Schema:
---------------
Form Data:
1. metadata: (required) JSON string with:
   - firstName (string, required)
   - lastName (string, required)
   Example:
   {
     "firstName": "John",
     "lastName": "Doe"
   }
2. files[]: (required) One or more image files (.jpg, .jpeg, .png)

Response:
---------
Success (200 OK):
{
    "message": "Person added successfully",
    "metadata_file": "John_Doe.json",
    "images": ["path_to_image1", "path_to_image2"]
}

Error (400 Bad Request):
- Missing metadata, images, or unsupported file format.
"""


@app.route('/add_person', methods=['POST'])
def add_person():
	if 'metadata' not in request.form or 'files[]' not in request.files:
		return jsonify({"error": "Metadata and images are required"}), 400

	# Retrieve metadata
	metadata = request.form.get('metadata')
	metadata = json.loads(metadata)

	# Retrieve first and last name to generate unique JSON file and image names
	first_name = metadata.get("firstName")
	last_name = metadata.get("lastName")

	if not first_name or not last_name:
		return jsonify({"error": "First and Last name are required in metadata"}), 400

	# Prepare unique file paths
	json_filename = f"{first_name}_{last_name}.json"
	json_filepath = os.path.join(knownDataDir, json_filename)

	image_paths = []

	# Loop through each file in the request
	for img in request.files.getlist('files[]'):
		# Get the original filename's extension (e.g., .jpg, .png)
		_, file_extension = os.path.splitext(img.filename)
		if file_extension.lower() not in ['.png', '.jpg', '.jpeg']:
			return jsonify({"error": "Only PNG, JPG, and JPEG files are allowed"}), 400

		# Create a unique filename with the correct extension
		unique_filename = f"{first_name}_{last_name}_{uuid.uuid4().hex}{file_extension}"
		image_save_path = os.path.join(knownFacesDir, unique_filename)

		# Save image to known_faces directory
		img.save(image_save_path)
		image_paths.append(image_save_path)

	# Update the metadata to include the saved image paths
	metadata["knownFaceFileDir"] = image_paths

	# Save metadata as JSON in the known_data directory
	with open(json_filepath, 'w') as json_file:
		json.dump(metadata, json_file, indent=4)

	loadKnownFaces()

	return jsonify({
		"message": "Person added successfully",
		"metadata_file": json_filename,
		"images": image_paths
	}), 200


if __name__ == '__main__':
	app.run(debug=True)
