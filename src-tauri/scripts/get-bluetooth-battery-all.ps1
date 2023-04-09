Param([switch]$d, [switch]$isDebug)
$isDebug = $d.IsPresent -or $isDebug.IsPresent

# https://learn.microsoft.com/windows/client-management/mdm/policy-csp-bluetooth
#           Bluetooth Base UUID: "00000000-0000-1000-8000-00805F9B34FB" # BTBook.pdf P.8
$local:br_battery_service_uuid = "0000111E-0000-1000-8000-00805F9B34FB" # Hands Free Profile (HFP)*: 0x111E + BASE UUID
$local:BatteryLevel = '{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2'
$local:BluetoothAddressId = "DEVPKEY_Bluetooth_DeviceAddress"

# Get-PnpDevice -Class Bluetooth | Get-PnpDeviceProperty -KeyName "DEVPKEY_Bluetooth_LastConnectedTime"
# Get-PnpDevice -Class AudioEndpoint | Select-Object FriendlyName, Status, InstanceId # is connected

$local:Result = @();
Get-PnpDevice -InstanceId "BTHENUM\{$local:br_battery_service_uuid}_*" | ForEach-Object {
  $local:Properties = @{
    "instance_id"   = $_.InstanceId
    "friendly_name" = $_.friendlyName
  };

  Get-PnpDeviceProperty -InstanceId $_.InstanceId -KeyName $local:BatteryLevel, $local:BluetoothAddressId |
  ForEach-Object {
    $local:data = $_.Data #! Note: Need local variable! otherwise it will be null.
    $local:keyname = $_.KeyName
    switch ($_.KeyName) {
      $local:BatteryLevel { $local:keyname = "battery_level" }
      $local:BluetoothAddressId { $local:keyname = "bluetooth_address" }
    }
    $local:Properties += @{ $local:keyname = $local:data }

  }
  $Result += $Properties
}
ConvertTo-Json -InputObject $local:Result

# Read-Host "Press any key."
