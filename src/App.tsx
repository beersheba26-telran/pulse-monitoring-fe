
import './App.css'
import { useNotificationsPolling } from './services/useNotificationsPolling'

function App() {
  const { data, isLoading, isError, error, isFetching } = useNotificationsPolling({
    pollIntervalMs: 5000,
  })

  if (isLoading) {
    return <p>Loading notifications...</p>
  }

  if (isError) {
    return <p>Failed to load notifications: {error.message}</p>
  }

  return (
    <main>
      <h1>Notifications</h1>
      <p>{isFetching ? 'Refreshing...' : 'Up to date'}</p>
      <ul>
        {data?.map((notification) => (
          <li key={notification.id}>
            <strong>{notification.type}</strong> ({notification.severity}) -{' '}
            {notification.message} - {notification.timestamp.toLocaleString()}
          </li>
        ))}
      </ul>
    </main>
  )
}

export default App
