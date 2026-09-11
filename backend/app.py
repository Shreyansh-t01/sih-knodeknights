"""
Main Flask Application Server for GovBridge RPA Ecosystem
"""
import os
from flask import Flask, redirect, render_template, request, url_for, send_from_directory
from flask_cors import CORS

from api_routes import api_bp
from demo_routes import demo_bp
from bot_storage import storage

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static"
)

# Enable CORS for Chrome Extension requests and external webhook calls
CORS(app, resources={r"/*": {"origins": "*"}})

# Register blueprints
app.register_blueprint(api_bp, url_prefix="/api")
app.register_blueprint(demo_bp)


# --------------------------------------------------------------------------
# Web Portal Views
# --------------------------------------------------------------------------

@app.route("/")
def index():
    """Redirect home route directly to Visual Workflow Builder"""
    return redirect(url_for("builder"))


@app.route("/builder")
def builder():
    """Visual Workflow Canvas matching the GovBridge wireframe"""
    bot_id = request.args.get("bot_id")
    bot = None
    if bot_id:
        bot = storage.get_bot(bot_id)
    if not bot:
        # Default to the seed GovBridge login bot
        bots = storage.list_bots()
        bot = bots[0] if bots else None

    return render_template("builder.html", bot=bot)


@app.route("/extension-guide")
def extension_guide():
    """Chrome Extension installation guide"""
    return render_template("extension_guide.html")


@app.route("/extension/<path:filename>")
def serve_extension_file(filename):
    """Serve extension assets for testing or in-browser preview"""
    ext_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "extension"))
    return send_from_directory(ext_dir, filename)


if __name__ == "__main__":
    print("=" * 60)
    print(" GovBridge RPA Bot Server Starting on http://127.0.0.1:5000")
    print(" * Visual Builder:     http://127.0.0.1:5000/builder")
    print(" * Demo Target Portal: http://127.0.0.1:5000/demo-target")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
