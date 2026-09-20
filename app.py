import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
client = OpenAI(
    api_key=API_KEY or "not-configured",
    base_url="https://openrouter.ai/api/v1"
)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/ai", methods=["POST"])
def ai():
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()
    mode = (data.get("mode") or "chat").strip()

    if not prompt:
        return jsonify({"error": "Please enter a prompt."}), 400

    if not API_KEY:
        return jsonify({
            "error": "OPENROUTER_API_KEY is not configured. Add it to your .env file."
        }), 500

    system = {
        "writer": "You are a helpful AI writing assistant. Give clear, useful output.",
        "script": "You are an expert short-video script writer. Create engaging, concise scripts.",
        "caption": "You create social-media captions and hashtags. Keep them natural and useful.",
        "chat": "You are a helpful general AI assistant."
    }.get(mode, "You are a helpful AI assistant.")

    try:
        response = client.chat.completions.create(
            model=os.getenv("OPENROUTER_MODEL", "openrouter/free"),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ]
        )
        answer = response.choices[0].message.content
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
