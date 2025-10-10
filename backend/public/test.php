<?php
header('Content-Type: application/json');
echo json_encode(['test' => 'direct php script', 'time' => time()]);
