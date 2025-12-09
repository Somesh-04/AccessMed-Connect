<?php
$host = "localhost";
$dbname = "user_auth";
$username = "root";    // XAMPP default
$password = "";        // XAMPP default (empty)

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
