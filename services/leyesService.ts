const API_URL = "http://192.168.18.24:8080/api/v1/leyes/proyectos";

export const fetchLeyes = async (query = "", rowStart = 0, pageSize = 10) => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                perParId: 2021,
                palabras: query || null,
                rowStart,
                pageSize,
            }),
        });

        const data = await response.json();
        return {
            leyes: data.data?.proyectos || [],
            totalRows: data.data?.rowsTotal || 0,
        };
    } catch (error) {
        console.error("Error fetching leyes:", error);
        return { leyes: [], totalRows: 0 };
    }
};
