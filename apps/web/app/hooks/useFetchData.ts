import { useState, useEffect, useMemo } from "react";

interface UseFetchDataOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
}

const useFetchData = <T>(url: string, options: UseFetchDataOptions = {}) => {
  const { method = "GET", headers = {}, body } = options;

  // Memoize headers and body to prevent infinite loop
  const memoizedHeaders = useMemo(() => headers, [JSON.stringify(headers)]);
  const memoizedBody = useMemo(() => body, [JSON.stringify(body)]);

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...memoizedHeaders,
        },
        body: memoizedBody ? JSON.stringify(memoizedBody) : null,
      };

      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const result: T = await response.json();
        setData(result);
      } catch (err) {
        setError((err as Error).message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, method, memoizedHeaders, memoizedBody]);

  return { data, loading, error };
};

export default useFetchData;
