export async function fetchData<T>(
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    params?: Record<string, any>,
    body?: any
  ): Promise<T> {
    try {
      let fullUrl = url;
  
      // Si hay query params y el método es GET, los agregamos a la URL
      if (params && method === "GET") {
        const queryParams = new URLSearchParams(params).toString();
        fullUrl += `?${queryParams}`;
      }
  
      const response = await fetch(fullUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: method !== "GET" ? JSON.stringify(body) : null,
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("fetchData error:", error);
      throw error;
    }
  }
  