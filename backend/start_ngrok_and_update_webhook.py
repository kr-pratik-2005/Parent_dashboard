import os
import time
import requests
from pyngrok import ngrok
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth

# Load your .env variables
load_dotenv()

# Razorpay credentials
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")

# Your local backend port
LOCAL_PORT = 5000

def start_ngrok():
    print("🔌 Starting ngrok...")
    public_url = ngrok.connect(LOCAL_PORT, bind_tls=True)
    print(f"🌐 Public URL: {public_url}")
    return str(public_url)

def create_razorpay_webhook(ngrok_url):
    print("🔁 Registering webhook with Razorpay...")
    url = "https://api.razorpay.com/v1/webhooks"

    payload = {
        "url": f"{ngrok_url}/razorpayWebhook",
        "active": True,
        "events": {
            "payment.captured": True,
            "payment_link.paid": True
        },
        "secret": WEBHOOK_SECRET
    }

    response = requests.post(
        url,
        auth=HTTPBasicAuth(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        json=payload
    )

    if response.status_code == 200 or response.status_code == 201:
        print("✅ Webhook created successfully.")
    else:
        print(f"❌ Failed to create webhook. Response: {response.status_code}, {response.text}")

if __name__ == "__main__":
    public_url = start_ngrok()
    create_razorpay_webhook(public_url)
    print("🚀 Webhook is live and pointing to your ngrok URL.")

    # Keep the script running to keep ngrok alive
    try:
        while True:
            time.sleep(10)
    except KeyboardInterrupt:
        print("🛑 Stopping...")
        ngrok.kill()
