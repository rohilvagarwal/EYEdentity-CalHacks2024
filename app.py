import os
import face_recognition
import numpy as np
from flask import Flask, request, jsonify, render_template
from PIL import Image
import io

app = Flask(__name__)

# Load known faces
known_faces = {}
known_faces_dir = "known_faces"

for filename in os.listdir(known_faces_dir):
	if filename.endswith(".jpg") or filename.endswith(".png"):
		name = os.path.splitext(filename)[0]
		image_path = os.path.join(known_faces_dir, filename)
		face_image = face_recognition.load_image_file(image_path)
		face_encoding = face_recognition.face_encodings(face_image)[0]
		known_faces[name] = face_encoding


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
		for face_encoding in face_encodings: #if multiple faces
			matches = face_recognition.compare_faces(list(known_faces.values()), face_encoding) #current face vs known faces
			name = "Unknown"
			face_distances = face_recognition.face_distance(list(known_faces.values()), face_encoding) #smaller the num, closer the match

			best_match_index = np.argmin(face_distances) #pick smallest num index

			if matches[best_match_index]:
				name = list(known_faces.keys())[best_match_index]
				print(name)
			results.append(name)

		return jsonify({"recognized_faces": results})


if __name__ == '__main__':
	app.run(debug=True)