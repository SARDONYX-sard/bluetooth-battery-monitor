# https://learn.microsoft.com/windows/client-management/mdm/policy-csp-bluetooth
#           Bluetooth Base UUID: "00000000-0000-1000-8000-00805F9B34FB" # BTBook.pdf P.8
$local:BatteryLevel = '{104EA319-6EE2-4701-BD47-8DDBF425BBE5} 2'
$local:BatteryServiceUuid = "0000111E-0000-1000-8000-00805F9B34FB" # Hands Free Profile (HFP)*: 0x111E + BASE UUID
$local:BluetoothAddressId = "DEVPKEY_Bluetooth_DeviceAddress"
$local:BluetoothClass = "DEVPKEY_Bluetooth_ClassOfDevice"
$local:LastArraivvalDate = "DEVPKEY_Device_LastArrivalDate" # Probably RFC3339 format

# Get-PnpDevice -Class Bluetooth | Get-PnpDeviceProperty -KeyName "DEVPKEY_Bluetooth_LastConnectedTime"
# Get-PnpDevice -Class AudioEndpoint | Select-Object FriendlyName, Status, InstanceId # is connected

$local:Result = @();
Get-PnpDevice -InstanceId "BTHENUM\{$local:BatteryServiceUuid}_*" | ForEach-Object {
  $local:Properties = @{
    "instance_id"   = $_.InstanceId
    "friendly_name" = $_.friendlyName
  };

  Get-PnpDeviceProperty -InstanceId $_.InstanceId -KeyName $local:BatteryLevel, $local:BluetoothAddressId, $local:BluetoothClass, $local:LastArraivvalDate |
  ForEach-Object {
    $local:data = $_.Data #! Note: Need local variable! otherwise it will be null.
    $local:keyname = $_.KeyName
    switch ($_.KeyName) {
      $local:BatteryLevel { $local:keyname = "battery_level" }
      $local:BluetoothAddressId { $local:keyname = "bluetooth_address" }
      $local:BluetoothClass { $local:keyname = "bluetooth_class" }
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
  $Result += $Properties
}

ConvertTo-Json $local:Result
# Read-Host "Press any key."
