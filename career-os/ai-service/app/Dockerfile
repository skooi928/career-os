# 1. Use a slim Python base image to keep the final container lightweight
FROM python:3.10-slim

# 2. Force Python to not buffer output (makes logs appear immediately in Google Cloud)
ENV PYTHONUNBUFFERED=1

# 3. Set the directory where your app will live inside the container
WORKDIR /app

# 4. Copy ONLY the requirements file first. 
# This is a Docker trick: if your requirements don't change, Docker caches this step, 
# making future builds much faster.
COPY requirements.txt .

# 5. Install your Python dependencies. 
# We use --no-cache-dir so we don't store leftover installation files, saving space.
RUN pip install --no-cache-dir -r requirements.txt

# 6. Install Gunicorn, a production-grade server for Flask
RUN pip install gunicorn

# 7. Copy the rest of your files (app.py, your .pth/.h5 model weights, etc.)
COPY . .

# 8. Expose the port your Flask app runs on 7860
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]