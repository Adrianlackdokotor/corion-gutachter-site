<?php
// ### CONFIGURARE ###

// Directorul pentru salvarea conversațiilor.
// Acest director trebuie creat manual pe server și trebuie să aibă permisiuni de scriere.
// Din motive de securitate, se recomandă plasarea acestuia în afara directorului public (web root), dacă este posibil.
$chat_log_directory = 'chat_logs/';

// ### PROCESARE SCRIPT ###

// Setează header-ul pentru a returna un răspuns JSON
header('Content-Type: application/json');

// Funcție pentru a trimite un răspuns de eroare și a opri scriptul
function send_chat_error_response($message) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

// Verifică dacă cererea este de tip POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_chat_error_response("Metodă de cerere invalidă.");
}

// Preluarea datelor JSON brute din corpul cererii
$json_data = file_get_contents('php://input');
$chat_history = json_decode($json_data, true);

// Verifică dacă decodarea JSON a avut succes și dacă este un array
if (json_last_error() !== JSON_ERROR_NONE || !is_array($chat_history)) {
    send_chat_error_response("Date de chat invalide sau corupte.");
}

// Nu salva conversațiile goale sau doar cu mesajul de salut
if (count($chat_history) < 2) {
    echo json_encode(['status' => 'success', 'message' => 'Conversație prea scurtă, nu a fost salvată.']);
    exit;
}

// Asigură-te că directorul de loguri există
if (!is_dir($chat_log_directory)) {
    if (!mkdir($chat_log_directory, 0755, true)) {
        send_chat_error_response("Directorul pentru logurile de chat nu a putut fi creat.");
    }
}

// Formatează conversația pentru lizibilitate
$formatted_conversation = "Conversație începută la: " . date("d.m.Y H:i:s") . "\n";
$formatted_conversation .= "IP Client (informativ): " . $_SERVER['REMOTE_ADDR'] . "\n";
$formatted_conversation .= "------------------------------------------------------------\n\n";

foreach ($chat_history as $message) {
    $role = htmlspecialchars($message['role'] ?? 'Necunoscut');
    $text = htmlspecialchars($message['parts'][0]['text'] ?? 'Mesaj gol');
    
    // Înlocuiește "model" cu un nume mai prietenos
    $sender = ($role === 'model') ? 'Asistent AI' : 'Utilizator';
    
    $formatted_conversation .= "[" . $sender . "]:\n" . $text . "\n\n";
}

$formatted_conversation .= "------------------------------------------------------------\n";
$formatted_conversation .= "Conversație încheiată la: " . date("d.m.Y H:i:s") . "\n";

// Creează un nume de fișier unic
$filename = $chat_log_directory . 'chat_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.txt';

// Salvează conversația în fișier
if (file_put_contents($filename, $formatted_conversation) === false) {
    send_chat_error_response("Conversația nu a putut fi salvată pe server.");
}

// Trimite un răspuns de succes
echo json_encode(['status' => 'success', 'message' => 'Conversație salvată cu succes.']);

?>
