export async function callApi(path, method = "GET", options = {}) {
  try {
    const response = await fetch(`http://localhost:3000${path}`, {
      method,
      credentials: "include",
      ...options,
    });

    if (response.ok) {
      return await response.json();
    } else {
      const errorData = await response.json().catch(() => null);
      console.log('errorData',errorData)
      if(errorData.errorMsg){
        return errorData;
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error(`Error calling API ${path}: ${error.message}`);
  }
}
