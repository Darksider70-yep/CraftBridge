FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY services/api-gateway/requirements.txt /tmp/requirements.txt
RUN apt-get update && apt-get install -y libmagic1 && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY services/api-gateway/ /app/

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
