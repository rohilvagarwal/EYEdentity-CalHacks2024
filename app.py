import os
import face_recognition
import numpy as np
from flask import Flask, request, jsonify, render_template
from PIL import Image
import io
import json

app = Flask(__name__)

# Load known faces
knownFaces = {}
knownDataDir = "known_data"

for filename in os.listdir(knownDataDir):
	if filename.endswith(".json"):  #process JSON files
		json_path = os.path.join(knownDataDir, filename)

		# Load the JSON metadata
		with open(json_path, 'r') as json_file:
			metadata = json.load(json_file)
			first_name = metadata["firstName"]
			last_name = metadata["lastName"]
			full_name = f"{first_name} {last_name}"
			image_path = metadata["knownFaceFileDir"]  # Get the image path from the JSON

			# Load and encode the face from the image path
			face_image = face_recognition.load_image_file(image_path)
			face_encoding = face_recognition.face_encodings(face_image)[0]

			# Store the face encoding and metadata in known_faces
			knownFaces[full_name] = {
				"encoding": face_encoding,
				"metadata": metadata  # Store additional metadata (companyInfo, locationMet, etc.)
			}


@app.route('/')
def index():
	return render_template('index.html')


@app.route('/recognize', methods=['POST'])
def recognize_face():
	if 'file' not in request.files:
		return jsonify({"error": "No file part"}), 400

	file = request.files['file']
	if file.filename == '':
		return jsonify({"error": "No selected file"}), 400

	if file:
		# Read the image file
		image_bytes = file.read()
		image = face_recognition.load_image_file(io.BytesIO(image_bytes))

		# Find face locations and encodings
		face_locations = face_recognition.face_locations(image)
		face_encodings = face_recognition.face_encodings(image, face_locations)

		results = []
		for face_encoding in face_encodings:  # If multiple faces
			minAccuracy = 0.45

			# Compare current face encoding to known faces
			matches = face_recognition.compare_faces(
				[data["encoding"] for data in knownFaces.values()],
				face_encoding,
				tolerance=1-minAccuracy
			)

			face_distances = face_recognition.face_distance(
				[data["encoding"] for data in knownFaces.values()],
				face_encoding
			)
			best_match_index = np.argmin(face_distances)  # Pick smallest distance (closest match)

			face_accuracies = [1-x for x in face_distances]

			print(matches)
			print(face_accuracies)

			if matches[best_match_index]:
				# Get the matched person's name and metadata
				matched_name = list(knownFaces.keys())[best_match_index]
				metadata = knownFaces[matched_name]["metadata"]
				print(f"Match found: {matched_name}")

				# Include metadata in the result
				result = {
					"name": matched_name,
					"accuracy": face_accuracies[best_match_index],
					"firstName": metadata["firstName"],
					"lastName": metadata["lastName"],
					"companyInfo": metadata.get("companyInfo", "N/A"),
					"locationMet": metadata.get("locationMet", "Unknown")
				}
			else:
				result = {"name": "Unknown"}

			results.append(result)

		return jsonify({"recognized_faces": results})


if __name__ == '__main__':
	app.run(debug=True)
