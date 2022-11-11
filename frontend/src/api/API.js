const BASE_URL = 'https://toggl-hire-frontend-homework.onrender.com'

export const send = async (emails) => {
  const url = `${BASE_URL}/api/send`
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails }),
  }

  const response = await fetch(url, request)
  if (response.status === 200) {
    return { error: 'success' }
  } else {
    return await response.json()
  }
}
