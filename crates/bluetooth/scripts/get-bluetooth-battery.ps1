# Param(
#   [string]$InstanceId = ""
# )
$local:BatteryLevel = "{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2"
$local:BluetoothAddressId = "DEVPKEY_Bluetooth_DeviceAddress"
$local:friendlyName = "DEVPKEY_Device_FriendlyName"
$local:IsConnected = "{83DA6326-97A6-4088-9453-A1923F573B29} 15"

$local:Properties = @{ "instance_id" = $InstanceId };
Get-PnpDeviceProperty -InstanceId $InstanceId -KeyName $local:BatteryLevel, $local:BluetoothAddressId, $local:friendlyName, $local:IsConnected |
ForEach-Object {
  $local:data = $_.Data #! Note: Need local variable! otherwise it will be null.
  $local:keyname = $_.KeyName

  switch ($keyName) {
    $local:BatteryLevel { $local:keyname = "battery_level" }
    $local:BluetoothAddressId { $local:keyname = "bluetooth_address" }
    $local:friendlyName { $local:keyname = "friendly_name" }
    $local:IsConnected { $local:keyname = "is_connected" }
  }
  $local:Properties += @{ $local:keyname = $local:data }
}
ConvertTo-Json -InputObject $local:Properties

# Read-Host "Press any key."
