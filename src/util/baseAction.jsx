import config from "./config";

const userDataString = localStorage.getItem("YaraUser");
const userData = userDataString ? JSON.parse(userDataString) : {};

export function setProfile(response, setUser) {
  let updatedUserData = { ...response.data };
  updatedUserData.token = response.data.token;
  updatedUserData.userName = response.data.userInformation.username;
  // updatedUserData.lastName = response.data.lastName;
  updatedUserData.profile = response.data.userProfile.profile;
  // updatedUserData.cellphone = response.data.cellphone;
  updatedUserData.email = response.data.userInformation.email;
  updatedUserData.userId = response.data.userInformation.userId;
  setUser(updatedUserData);
  localStorage.setItem("YaraUser", JSON.stringify(updatedUserData));
}

export function signIn(formData, rememberMe, setIsLoading, setError, setUser, navigate) {
  setIsLoading(true);
  const requestData = {
    username: formData.username,
    password: formData.password,
    // rememberMe: rememberMe,
  };

  fetch(`${config.apiUrl}sign_in/authenticate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setProfile(data, setUser);
        navigate("/");
        window.location.reload();
      } else {
        // Throw an error if success is false
        throw new Error(data.msg);
      }
    })
    .catch((error) => {
      // Set the error message from the error object
      setError(error.message);
      console.error("Fetch Error: ", error);
    })
    .finally(() => {
      setIsLoading(false);
    });
}

// fetching details
export async function fetchData(baseURL, errorMsg) {
  const url = `${baseURL}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(errorMsg);
    }

    const responseData = await response.json();

    if (Array.isArray(responseData.data) && responseData.data.length > 0) {
      const firstRow = responseData.data[0];
      const tableColumns = [];

      for (const key in firstRow) {
        tableColumns.push({
          field: key,
          headerName: key,
          flex: 1,
          align: "left",
        });
      }

      return { columns: tableColumns, data: responseData.data };
    } else {
      // Handle case where there is no data or it's not an array
      throw new Error("No data found");
    }
  } catch (error) {
    console.error("Getting data has an error: ", error);
    throw error;
  }
}

export async function crmRequestPost(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Form submission failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting the form data:", error);
    throw error;
  }
}
