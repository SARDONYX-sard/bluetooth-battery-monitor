# Param(
#   [string]$InstanceId = ""
# )
$local:BatteryLevel = "{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2"
$local:BluetoothAddressId = "DEVPKEY_Bluetooth_DeviceAddress"
$local:BluetoothClass = "DEVPKEY_Bluetooth_ClassOfDevice"
$local:friendlyName = "DEVPKEY_Device_FriendlyName"
$local:IsConnected = "{83DA6326-97A6-4088-9453-A1923F573B29} 15"
$local:LastArraivvalDate = "DEVPKEY_Device_LastArrivalDate" # Probably RFC3339 format

$local:Properties += @{
  "instance_id" = $InstanceId
};
Get-PnpDeviceProperty -InstanceId $InstanceId -KeyName $local:BatteryLevel, $local:BluetoothAddressId, $local:friendlyName, $local:IsConnected, $local:BluetoothClass, $local:LastArraivvalDate |
ForEach-Object {
  $local:data = $_.Data #! Note: Need local variable! otherwise it will be null.
  $local:keyname = $_.KeyName

  switch ($keyName) {
    $local:BatteryLevel { $local:keyname = "battery_level" }
    $local:BluetoothAddressId { $local:keyname = "bluetooth_address" }
    $local:friendlyName { $local:keyname = "friendly_name" }
    $local:BluetoothClass { $local:keyname = "bluetooth_class" }
    $local:IsConnected { $local:keyname = "is_connected" }
    $local:LastArraivvalDate { $local:keyname = "last_arrival_date" }
  }
  if ($_.KeyName -eq $local:LastArraivvalDate) {
    # NOTE: It must be a string or it will become a Date() object.
    # 2001-07-08T00:34:60.026490+09:30	ISO 8601 / RFC 3339 date & time format.
    # o: %Y-%m-%dT%H:%M:%S%.f%:z
    $local:Properties += @{ $local:keyname = $local:data.toString("o") }
  }
  else {
    $local:Properties += @{ $local:keyname = $local:data }
  }
}

ConvertTo-Json $local:Properties

# Read-Host "Press any key."
