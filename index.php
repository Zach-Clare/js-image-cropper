<?php

$uploadDirectory = __DIR__ . "/upload/";
if(!is_dir($uploadDirectory)) {
    mkdir($uploadDirectory);
}

if(isset($_FILES["photo"])) {
    move_uploaded_file(
        $_FILES["photo"]["tmp_name"], 
        $uploadDirectory . "/" . $_FILES["photo"]["name"]
    );
}

echo('<a href="/index.html">back home</a>');