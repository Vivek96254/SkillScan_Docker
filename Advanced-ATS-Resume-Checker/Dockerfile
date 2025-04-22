# Use lightweight Python image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files
COPY . .

# Expose a default port (actual ports are set in docker-compose)
EXPOSE 5000

# Use environment variables to decide which app to run
CMD ["python", "app.py"]
