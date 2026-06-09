# Showing patient data
## Add new column into Dashboard table: "patient"
- it should contain patirnt name
## Add popover containing the patient data by right buton click on appropriate notification row
- all data items except patientId from PatientData
- Popover should be tied to appropriate table row even if it the last row and new notification is inserted in the table
# Work out required service update for getting the patient data
- update of NotificationService interface
- appropriate update of NotificationServiceImpl