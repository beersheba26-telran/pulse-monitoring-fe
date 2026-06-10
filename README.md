# ActionPopover update
- along with existing info appearing on ActionPopover there should be list of elready existing actions
## Action info
- date-time in local TZ
- action name
- doctor name
# HistoryPopover introducing
## Modal dialog showing list of actions
### Each action info item contains
- the same items like in "Action Info" item
- text of action explanation
# Dashboard update (triggering ActionPopover remains with no update)
## Introducing Callable columns 
- coursor of "pointer" type
- calling appropriate popover by hitting a column
### Column "status"
- hitting on this column should trigger HistoryPopover
### Column "patient name"
- hitting on this column should trigger PatientPopover
# Service update
- adding new required methods for implementing the above functionality
## Update method addActionToNotification
- it should update the status in accordance with the last action name from the specified in dashboard_types options


