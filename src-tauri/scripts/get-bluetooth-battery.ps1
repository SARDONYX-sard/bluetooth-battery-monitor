# Param(
#   [string]$InstanceId = "BTHENUM\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D\7&2CDD7520&0&9C431E0131A6_C00000000"
# )
$local:BatteryLevel = "{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2"
$local:BluetoothAddressId = "DEVPKEY_Bluetooth_DeviceAddress"
$local:friendlyName = "DEVPKEY_Device_FriendlyName"

$local:Properties = @{ "instance_id" = $InstanceId };
Get-PnpDeviceProperty -InstanceId $InstanceId -KeyName $local:BatteryLevel, $local:BluetoothAddressId, $local:friendlyName |
ForEach-Object {
  $local:data = $_.Data #! Note: Need local variable! otherwise it will be null.
  $local:keyname = $_.KeyName

  switch ($keyName) {
    $local:BatteryLevel { $local:keyname = "battery_level" }
    $local:BluetoothAddressId { $local:keyname = "bluetooth_address" }
    $local:friendlyName { $local:keyname = "friendly_name" }
  }
  $local:Properties += @{ $local:keyname = $local:data }
}
ConvertTo-Json -InputObject $local:Properties

# Read-Host "Press any key."
