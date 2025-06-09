<?php
// ### CONFIGURARE ###

// Adresa de e-mail unde vor fi trimise mesajele
$recipient_email = "info@corion-gutachter.de"; 

// Subiectul e-mailului pentru noile mesaje
$email_subject_prefix = "Neue Kontaktanfrage von der Webseite";

// Directorul pentru încărcarea fișierelor. Trebuie să existe și să aibă permisiuni de scriere.
$upload_directory = 'uploads/';

// Dimensiunea maximă permisă pentru un fișier (în bytes). 25MB = 25 * 1024 * 1024
$max_file_size = 25 * 1024 * 1024; 

// Tipurile de fișiere permise (MIME types)
$allowed_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];


// ### PROCESARE SCRIPT ###

// Setează header-ul pentru a returna un răspuns JSON
header('Content-Type: application/json');

// Funcție pentru a trimite un răspuns de eroare și a opri scriptul
function send_error_response($message) {
    http_response_code(400); // Bad Request
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

// Verifică dacă cererea este de tip POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_error_response("Ungültige Anfragemethode.");
}

// Preluarea și curățarea datelor din formular
$name = isset($_POST['name']) ? filter_var(trim($_POST['name']), FILTER_SANITIZE_STRING) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? filter_var(trim($_POST['phone']), FILTER_SANITIZE_STRING) : '';
$subject = isset($_POST['subject']) ? filter_var(trim($_POST['subject']), FILTER_SANITIZE_STRING) : 'Kein Betreff';
$message_body = isset($_POST['message']) ? filter_var(trim($_POST['message']), FILTER_SANITIZE_STRING) : '';
$privacy_policy_accepted = isset($_POST['privacy']);

// Validare de bază - Doar emailul și acordul de confidențialitate sunt obligatorii
if (empty($email)) {
    send_error_response("Bitte geben Sie Ihre E-Mail-Adresse ein, damit wir Sie kontaktieren können.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_error_response("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
}

if (!$privacy_policy_accepted) {
    send_error_response("Bitte stimmen Sie der Datenschutzerklärung zu.");
}

// Procesarea fișierelor încărcate
$uploaded_files_info = [];
$has_uploads = isset($_FILES['carPhotos']) && !empty(array_filter($_FILES['carPhotos']['name']));

if ($has_uploads) {
    // Creează un subdirector unic pentru această trimitere
    $submission_dir_name = uniqid('anfrage_', true);
    $submission_path = $upload_directory . $submission_dir_name . '/';

    if (!is_dir($submission_path) && !mkdir($submission_path, 0755, true)) {
        send_error_response("Fehler beim Erstellen des Upload-Verzeichnisses.");
    }
    
    $file_count = count($_FILES['carPhotos']['name']);

    for ($i = 0; $i < $file_count; $i++) {
        // Verifică dacă există o eroare la încărcare
        if ($_FILES['carPhotos']['error'][$i] !== UPLOAD_ERR_OK) {
            // Ignoră fișierele goale, dar raportează alte erori
            if ($_FILES['carPhotos']['error'][$i] !== UPLOAD_ERR_NO_FILE) {
                 send_error_response("Fehler beim Hochladen der Datei: " . $_FILES['carPhotos']['name'][$i]);
            }
            continue;
        }

        $file_name = basename($_FILES['carPhotos']['name'][$i]);
        $file_tmp_name = $_FILES['carPhotos']['tmp_name'][$i];
        $file_size = $_FILES['carPhotos']['size'][$i];
        
        // Verifică dimensiunea fișierului
        if ($file_size > $max_file_size) {
            send_error_response("Die Datei '$file_name' ist zu groß. Maximale Größe ist " . ($max_file_size / 1024 / 1024) . " MB.");
        }
        
        // Verifică tipul MIME
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file_tmp_name);
        finfo_close($finfo);

        if (!in_array($mime_type, $allowed_mime_types)) {
            send_error_response("Ungültiger Dateityp für '$file_name'. Erlaubt sind nur Bilder (JPG, PNG, WEBP, GIF) und PDF-Dokumente.");
        }
        
        // Mută fișierul în directorul de destinație
        $destination = $submission_path . $file_name;
        if (move_uploaded_file($file_tmp_name, $destination)) {
            $uploaded_files_info[] = $file_name;
        } else {
            send_error_response("Die Datei '$file_name' konnte nicht gespeichert werden.");
        }
    }
}

// Compunerea mesajului de e-mail
$email_content = "Sie haben eine neue Nachricht über das Kontaktformular Ihrer Webseite erhalten:\n\n";
$email_content .= "------------------------------------------------------------\n";
$email_content .= "Name: " . (!empty($name) ? $name : "Nicht angegeben") . "\n";
$email_content .= "E-Mail: " . $email . "\n";
if (!empty($phone)) {
    $email_content .= "Telefon: " . $phone . "\n";
}
$email_content .= "Betreff: " . $subject . "\n\n";
$email_content .= "Nachricht:\n" . (!empty($message_body) ? $message_body : "Keine Nachricht hinterlassen.") . "\n";
$email_content .= "------------------------------------------------------------\n\n";

if (!empty($uploaded_files_info)) {
    $email_content .= "Der Nutzer hat folgende Dateien hochgeladen:\n";
    foreach ($uploaded_files_info as $file) {
        $email_content .= "- " . $file . "\n";
    }
    $email_content .= "\nDie Dateien befinden sich auf dem Server im Verzeichnis: " . $submission_dir_name . "\n";
} else {
    $email_content .= "Es wurden keine Dateien hochgeladen.\n";
}

// Setarea header-elor pentru e-mail
$headers = "From: no-reply@" . preg_replace('#^www\.#', '', $_SERVER['SERVER_NAME']) . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Trimiterea e-mailului
if (mail($recipient_email, $email_subject_prefix . ": " . $subject, $email_content, $headers)) {
    // Trimite răspuns de succes
    echo json_encode(['status' => 'success', 'message' => 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.']);
} else {
    // Trimite răspuns de eroare dacă funcția mail() eșuează
    send_error_response("Beim Senden der E-Mail ist ein serverseitiger Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
}

?>
