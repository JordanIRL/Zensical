# List Devices with Graph

### List Devices

```powershell
Connect-MgGraph -Scopes "DeviceManagementManagedDevices.Read.All"

Get-MgDeviceManagementManagedDevice -All |
    Select-Object `
        complianceState,
        deviceName,
        manufacturer,
        model,
        userDisplayName,
        userPrincipalName,
        serialNumber,
        managedDeviceName,
        lastSyncDateTime,
        enrolledDateTime,
        operatingSystem,
        imei,
        deviceCategoryDisplayName,
        iccid,
        osVersion,
        enrollmentProfileName |

Export-Excel -Path ".\Export\AllDevices_$(Get-Date -format dd-MM-yyyy_HH.mm).xlsx"
-WorksheetName 'All Devices' -AutoSize -FreezeTopRow -BoldTopRow
```
> [Full Variable List - Microsoft Learn](https://learn.microsoft.com/en-us/graph/api/resources/intune-devices-manageddevice?view=graph-rest-1.0)
