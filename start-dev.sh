#!/usr/bin/env bash
echo "==================================================================="
echo "  Retail Inventory Management System (Agile Capstone P_022)"
echo "==================================================================="

(cd backend && npm start) &
BACKEND_PID=$!

sleep 3

(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID (http://localhost:5000)"
echo "Frontend PID: $FRONTEND_PID (http://localhost:3000)"

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM EXIT
wait
