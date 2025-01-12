#!/bin/bash
ffmpeg -re -i input_audio.mp3 -f mp3 http://localhost:5000/stream