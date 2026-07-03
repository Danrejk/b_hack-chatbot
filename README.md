# Crisis Readiness AI: Run Guide

## 1. Quick Start (Daily Development)
If you already have the project set up and just need to spin it up for development, follow these steps. You will need three separate terminal windows.

**Terminal 1: Start the Backend**
Open a terminal in `chatbot/apps/backend`:

# 1. Activate virtual environment
# On macOS/Linux:
```source .venv/bin/activate```
# On Windows:
```.venv\Scripts\activate```

# 2. Set PYTHONPATH to the current directory
```export PYTHONPATH=$PYTHONPATH:.```

# 3. Run the FastAPI server
```python -m uvicorn app.main:app --reload```


**Terminal 2: Start the Frontend**
Open a new terminal in the project root folder (where your `package.json` is):

```npx expo start```


**Terminal 3: USB Port Tunneling (For physical Android testing)**
If testing via USB, open a fresh terminal on your laptop to bridge your local servers to your phone:

# Tunnel Expo server
```adb reverse tcp:8081 tcp:8081```

# Tunnel FastAPI backend server
```adb reverse tcp:8000 tcp:8000```

*(Once running, press `a` in the Expo terminal to force it to open on your phone).*

---

## 2. Full Setup (From Scratch)
If you are starting completely from scratch on a new machine, do this setup first.

**Step 1: Install Frontend Dependencies**
Open a terminal in the project root:

```npm install```


**Step 2: Setup Python Environment**
Open a terminal in `chatbot/apps/backend`:

# 1. Create and activate a virtual environment
```python3 -m venv .venv```
```source .venv/bin/activate```
# (or .venv\Scripts\activate on Windows)

# 2. Install required packages
```pip install pymilvus[milvus_lite] openai python-dotenv fastapi uvicorn```


**Step 3: Configure Environment Variables**
Still in `chatbot/apps/backend`:

# 1. Copy the example environment file
```cp .env.example .env ``` # (or copy .env.example .env on Windows)

* Crucial: Open the new `.env` file in your code editor and add your actual `OPENAI_API_KEY`.

**Step 4: Initialize Storage Layer**
Still in `chatbot/apps/backend`:

# 1. Set the PYTHONPATH
```export PYTHONPATH=$PYTHONPATH:.```

# 2. Initialize the SQLite database
```python scripts/init_db.py```

# 3. Initialize the Milvus vector store
```python scripts/init_vector_store.py```

*(If both commands finish without errors, your database and vector files are ready).*

Once these steps are complete, proceed to the **Quick Start** section at the top of this guide to run the app.
