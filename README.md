# NovaAI Studio

A starter AI tools website built with Python + Flask.

## Run locally

1. Install Python.
2. Open this folder in PyCharm.
3. Open Terminal:
   pip install -r requirements.txt
4. Copy `.env` to `.env`.
5. Put your OpenRouter API key in `.env`.
6. Run:
   python app.py
7. Open:
   http://127.0.0.1:5000

## Important

Never put your API key inside HTML or JavaScript. Keep it in `.env` on the server.

The Video Lab in this starter is browser-based preview functionality. Full AI text-to-video generation requires connecting an actual video-generation model/API later.


### Photo Compressor
The Photo Compressor runs entirely in the browser using the Canvas API. It does not require an API key or upload images to the Flask server.
