// Wait for the DOM content to be fully loaded before executing the code
document.addEventListener("DOMContentLoaded", function () {
  // Function to update the clock on the page
  function updateClock() {
    const now = new Date();
    let hours = now.getHours().toString().padStart(2, 0);
    const meridiem = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = hours.toString().padStart(2, 0);
    const minutes = now.getMinutes().toString().padStart(2, 0);
    const seconds = now.getSeconds().toString().padStart(2, 0);
    const timeString = `${hours}:${minutes}:${seconds} ${meridiem}`;
    document.getElementById("clock").textContent = timeString;
  }

  // Initial call to update the clock and set interval to update every second
  updateClock();
  setInterval(updateClock, 1000);

  try {
    // Variables to track shift status and button clicks
    let shift;
    let isTimeOutClicked = false;
    let isTimeInClicked = false;
    let startTime;
    let endTime;
    let totalBreakDuration = 0; // Variable to track total break duration
    let isBreakActive = false;
    // Event handler for the "Time In" button click
    // document.getElementById("timeInBtn").onclick = function () {
    //   if (!isTimeInClicked) {
    //     // Get the current time
    //     startTime = new Date();

    //     // Format the time as HH:mm:ss
    //     formattedTime = startTime.toLocaleTimeString();
    //     document.getElementById("timeInTime").innerHTML = `Your shift started at :${formattedTime}`;
    //     shift = true;
    //     isTimeInClicked = true;
    //   }
    // };

    // Event handler for the "Time Out" button click
    // document.getElementById("timeOutBtn").onclick = function () {
    // if (shift) {
    //   isTimeOutClicked = true;

    //   // Get the current time
    //   endTime = new Date();

    //   // Format the time as HH:mm:ss
    //   formattedTime2 = endTime.toLocaleTimeString();
    //   document.getElementById("timeOutTime").innerHTML = `Your shift ended at :${formattedTime2}`
    //   shift = false;
    //   isTimeInClicked = false;
    //   const { totalHours, breakDuration } = totalHourCalculator(startTime, endTime, totalBreakDuration);
    //   totalBreakDuration += breakDuration; // Update total break duration
    //   window.alert(`You worked for ${parseFloat(totalHours).toFixed(2)} hours. Total break duration: ${totalBreakDuration.toFixed(2)} minutes.`);
    // } else if (!isTimeInClicked) {
    //   window.alert("You cannot punch out before you start your shift");
    // }

    // twilio API  for sending sms messages

    // console.log('Sending confirmation message...');
    // const accountSid = 'AC76be89cce69a7705839035004025d6eb';
    // const authToken = '3b3743d083ccc4b19fbdf18f49473cd6';
    // const twilioPhoneNumber = '+15168149425';
    // const recipientPhoneNumber = '+';

    // const message = 'Your shift has ended.';

    // fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //     'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`)
    //   },
    //   body: new URLSearchParams({
    //     'To': recipientPhoneNumber,
    //     'From': twilioPhoneNumber,
    //     'Body': message
    //   })
    // })
    // .then(response => {
    //   if (response.ok) {
    //     console.log('Message sent successfully.');
    //     // Handle success
    //   } else {
    //     console.error('Failed to send message:', response.status, response.statusText);
    //     response.text().then(errorMessage => console.error('Error details:', errorMessage));
    //     // Handle error
    //   }
    // })
    //   .catch(error => {
    //     console.error('Error:', error);
    //   });

    // };

    // Get the break button element
    const breakButton = document.getElementById("breakInBtn");

    // Event listener for the "Break" button click
    breakButton.addEventListener("click", (event) => {
      // Function to handle when the break is active
      function breakActive() {
        event.target.style.backgroundColor = "white";
        event.target.style.color = "blue";
        event.target.textContent = "End Break";
        isBreakActive = true;

        // Save the break start time
        breakStartTime = new Date();
      }

      // Function to handle when the break is ended
      function endBreak() {
        event.target.style.backgroundColor = "rgb(122, 122, 241)";
        event.target.style.color = "white";
        event.target.textContent = "Take a Break";
        isBreakActive = false;

        // Calculate break duration
        const breakEndTime = new Date();
        const breakDuration = Math.ceil(
          (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60)
        );
        totalBreakDuration += breakDuration; // Update total break duration
      }

      // Check if the user has punched in
      if (isTimeInClicked) {
        // If the break is not active, start the break; otherwise, end the break
        if (!isBreakActive) {
          breakActive();
        } else {
          endBreak();
        }
      } else if (!isTimeInClicked) {
        window.alert("You cannot take a break before you punch in");
      }
    });
  } catch (err) {
    console.error(err);
    return err;
  }

  // Function to calculate total worked hours
  // function totalHourCalculator(startTime, endTime, totalBreakDuration) {
  //   const time1InSeconds = startTime.getTime() / 1000;
  //   const time2InSeconds = endTime.getTime() / 1000;

  //   let totalHours = (time2InSeconds - time1InSeconds) / 3600;

  //   // Deduct total break duration from the total hours
  //   totalHours -= totalBreakDuration / 60;

  //   return { totalHours: totalHours.toFixed(2), breakDuration: totalBreakDuration };
  // }
});

// Post the time on the data base
document.getElementById("timeInBtn").addEventListener("click", async () => {
  try {
    // Make an AJAX request to the server to trigger the time-in action
    const response = await fetch("/record/time-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      // Get the current time
      startTime = new Date();

      // Format the time as HH:mm:ss
      formattedTime = startTime.toLocaleTimeString();
      document.getElementById(
        "timeInTime"
      ).innerHTML = `Your shift started at :${formattedTime}`;
      console.log(data.message);
    } else {
      const errorData = await response.json();
      if (
        errorData.message === "Previous shift time-out hasn't been recorded"
      ) {
        alert(
          "Please record the time-out for the previous shift before recording a new time-in."
        );
      } else {
        console.error("Error recording time-in:", errorData.message);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("timeOutBtn").addEventListener("click", async () => {
  try {
    // Make an AJAX request to the server to trigger the time-in action
    const response = await fetch("/record/time-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      endTime = new Date();

      // Format the time as HH:mm:ss
      formattedTime = endTime.toLocaleTimeString();
      document.getElementById(
        "timeOutTime"
      ).innerHTML = `Your shift has ended at :${formattedTime}`;
    } else {
      const errorData = await response.json();
      if (errorData.message === "You haven't started a shift yet.") {
        alert("Please start you shift before you time-out");
      }
      console.error(errorData.message);
    }
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("breakInBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/record/break-in", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ userId: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      breakInTime = new Date();

      formattedTime = breakInTime.toLocaleTimeString();
      document.getElementById(
        "break"
      ).innerHTML = `Your break has started at :${formattedTime}`;
    } else {
      const errorData = await response.json();
      if (errorData.message) {
        alert(errorData.message);
      }
      console.error(errorData.message);
    }
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("breakInBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/record/break-in", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ userId: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      breakInTime = new Date();

      formattedTime = breakInTime.toLocaleTimeString();
      document.getElementById(
        "breakInBtn"
      ).innerHTML = `Your break has started at :${formattedTime}`;
    } else {
      const errorData = await response.json();
      if (errorData.message) {
        alert(errorData.message);
      }
      console.error(errorData.message);
    }
  } catch (error) {
    console.error(error);
  }
});

document.getElementById("breakOutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/record/break-out", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ userId: 1 }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(data.message);
      breakOutTime = new Date();

      formattedTime = breakOutTime.toLocaleTimeString();
      document.getElementById(
        "breakOutBtn"
      ).innerHTML = `Your break has ended at :${formattedTime}`;
    } else {
      const errorData = await response.json();
      if (errorData.message) {
        alert(errorData.message);
      }
      console.error(errorData.message);
    }
  } catch (error) {
    console.error(error);
  }
});

// div box affect
document
  .getElementById("usernameButton")
  .addEventListener("mouseenter", function () {
    document.getElementById("userInfoBox").classList.add("show");
  });

document
  .getElementById("usernameButton")
  .addEventListener("mouseleave", function () {
    document.getElementById("userInfoBox").classList.remove("show");
  });
// light & dark mode

// Check if the user has already set a preference for dark mode
const isDarkMode = localStorage.getItem("darkMode") === "true";

// Function to toggle dark mode
const toggleDarkMode = () => {
  // Toggle the 'dark' class on the body element
  document.body.classList.toggle("dark");

  // Store the current mode preference in localStorage
  const currentMode = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", currentMode);
};

// Add event listener to the theme button
document.querySelector(".themeBtn").addEventListener("click", toggleDarkMode);

// Apply dark mode if it was previously set
if (isDarkMode) {
  document.body.classList.add("dark");
}

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    // Send a GET request to the /logout route
    const response = await fetch("/logout", {
      method: "GET",
    });

    if (response.ok) {
      // Redirect the user to the home page after logout
      window.location.href = "/";
    } else {
      // Display an error message if logout fails
      console.error("Logout failed");
    }
  } catch (error) {
    console.error("Error during logout:", error);
  }
});
