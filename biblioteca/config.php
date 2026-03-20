<?php

$server =  'localhost';
$banco = 'biblioteca';
$user = 'root';
$pass = ''

try {
    $pdo = new PDO("mysql:host=$server; dbname=$banco;charset=utf8", $user, $pass);
    $pdo->setAtTribte(PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro de conexão: ".$e->getMessage());
}

?>