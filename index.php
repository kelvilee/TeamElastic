<?php 

// Start a session if it doesn't already exist.

if (session_status() == PHP_SESSION_NONE) {
  session_start();
}

// Set session state of logged in to false if it isn't already set.

if (!isset($_SESSION['loggedin'])) {
  $_SESSION['loggedin'] = false;
}

require_once('easybitcoin.php');

// Initialize Bitcoin connection/object
//$bitcoin = new Bitcoin('t','e');
// Optionally, you can specify a host and port.
$bitcoin = new Bitcoin('t','e','127.0.0.1','8332');
// Defaults are:
//	host = localhost
//	port = 8332
//	proto = http
// If you wish to make an SSL connection you can set an optional CA certificate or leave blank
// This will set the protocol to HTTPS and some CURL flags
// $bitcoin->setSSL('/full/path/to/mycertificate.cert');
// Make calls to bitcoind as methods for your object. Responses are returned as an array.
// Examples:

$array3 = $bitcoin->getblockchaininfo();
echo "<br><br>getblockchaininfo: ".json_encode($array3);



$array2 = $bitcoin->getreceivedbyaddress('3GQxfekmRt3mfvUVREu4chJki29RMjTBhg', 0); 
echo "<br><br>getreceivedbyaddress: ".json_encode($array2);
echo "<br><br>";

$array = $bitcoin->getrawtransaction('0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',1);
echo "<br><br>getrawtransaction: ".wordwrap(json_encode($array), 200, "\n", true);
echo "<br><br>hash of transaction: " . $array['hash'];
// The full response (not usually needed) is stored in $this->response
// while the raw JSON is stored in $this->raw_response
// When a call fails for any reason, it will return FALSE and put the error message in $this->error
// Example:
echo $bitcoin->error;

echo "<br><br>";
// The HTTP status code can be found in $this->status and will either be a valid HTTP status code
// or will be 0 if cURL was unable to connect.
// Example:
echo "Status: ".$bitcoin->status;

// echo "raw_response: ".$this->response;

?>

<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Required meta tags -->
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">
  <title>Team Elastic Hackathon Blockchain Project</title>

</head>
  
<body class="">

<!-- Navigation -->
<nav class="" style="background-color: #1A75C1;">
</nav>

<!-- little comment -->

 


<!--- Footer -->
<footer class="">
</footer>
  
<?php if($_SESSION['loggedin'] === true): ?>
  
  <script>

  var User_Name='<?php echo $_SESSION['User_Name'];?>';
    
  // Store session status in a hidden variable for use by external JS file:
  document.getElementById("sessionStatusID").innerHTML = '<?php echo $_SESSION['loggedin'];?>'
  
  // Store username in a hidden variable for use by external JS file:
  document.getElementById("userNameID").innerHTML = User_Name;

  </script>

<?php endif; ?>

<script
src="https://code.jquery.com/jquery-3.3.1.js"
integrity="sha256-2Kok7MbOyxpgUVvAk/HJ2jigOSYS2auK4Pfzbm7uH60="
crossorigin="anonymous"></script>
<script 
src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ" crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
<script src="https://www.blockonomics.co/js/pay_button.js"></script>

</body>
</html>











