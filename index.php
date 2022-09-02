<?php

$uploadDirectory = __DIR__ . "/upload/";
if(!is_dir($uploadDirectory)) {
    mkdir($uploadDirectory);
}

echo($_POST["image_base64"]);

// the below doesn't work correctly.
$image64 = str_replace(' ', '+', $_POST["image_base64"]);
$imageDecoded = base64_decode($image64);
file_put_contents($uploadDirectory . "/" . "uploaded_image.jpeg", $imageDecoded);

// if(isset($_FILES["photo"])) {

//     move_uploaded_file(
//         $_FILES["photo"]["tmp_name"], 
//         $uploadDirectory . "/" . $_FILES["photo"]["name"]
//     );
// }

echo('<a href="/index.html">back home</a>');