// Select the form element
const form = document.querySelector("form");

// Add an event listener for the form submission
form.addEventListener('submit', e => {
  // Check if the form is not valid
  if (!form.checkValidity()) {
    // Prevent the default form submission
    e.preventDefault();
  }

  // Add a class to indicate that the form has been validated
  form.classList.add('was-validated');
});
// the code above will be fixed by evrim, it doesn't work right now!!!


// Code for updating the clock every second using setInterval
setInterval(() => {
  // Select the hour, minute, and second elements
  let hr = document.querySelector("#hr");
  let mn = document.querySelector("#mn");
  let sc = document.querySelector("#sc");

  // Get the current date and time
  let day = new Date();

  // Calculate the degrees for hour, minute, and second hands
  let hh = day.getHours() * 30;
  let mm = day.getMinutes() * 6;
  let ss = day.getSeconds() * 6;

  // Update the CSS transform property for each clock hand
  hr.style.transform = `rotateZ(${hh + (mm / 12)}deg)`;
  mn.style.transform = `rotateZ(${mm}deg)`;
  sc.style.transform = `rotateZ(${ss}deg)`;
}, 1000); // Repeat the function every 1000 milliseconds (1 second)

function createNewEmployee() {
  try {
    // Retrieve values from form inputs
    const efirstName = document.getElementById("firstName").value;
    const elastName = document.getElementById("lastName").value;
    const epassword = document.getElementById("password").value;

    // Validation checks
    if (efirstName == "" || efirstName.length <= 2 || !isNaN(efirstName)) {
      throw new Error("Your name cannot be less than 3 letters, empty, or a number");
    }
    if (elastName == "" || elastName.length <= 2 || !isNaN(elastName)) {
      throw new Error("Your last name cannot be less than 3 letters or empty");
    }
    if (epassword == "" || epassword.length <= 6) {
      throw new Error("Your password cannot be less than 6 letters or empty");
    }

    // Display a welcome message
    console.log(`Welcome ${efirstName} ${elastName}!`);
    console.log(`Your password is ${epassword}`);
  } catch (error) {
    // Log and handle errors
    console.error(error.message);
    return; // Exit the function if there's an error
  }
}

function createNewManager() {
  try {
    // Retrieve values from form inputs
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const password = document.getElementById("password").value;
   
    
    // Validation checks
    if (firstName == "" || firstName.length <= 2 || !isNaN(firstName)) {
      throw new Error("Your name cannot be less than 3 letters, empty, or a number");
    }
    if (lastName == "" || lastName.length <= 2 || !isNaN(lastName)) {
      throw new Error("Your last name cannot be less than 3 letters, empty, or a number");
    }
    if (password == "" || password.length <= 6) {
      throw new Error("Your password cannot be less than 6 letters or empty");
    }

    // Display a welcome message and manager details
    console.log(`Welcome ${firstName} ${lastName}!`);
    console.log(`Your password is: ${password}`);
  
  } catch (error) {
    // Log and handle errors
    window.alert(`${error.message}`);
    console.error(error.message);
    return; // Exit the function if there's an error
  }
}

function createUserBtn(event) {
  // Prevent the default form submission
  event.preventDefault();

  // Check if the 'employee' checkbox is checked
  if (document.querySelector("#employee").checked) {
    // Call the function to create a new employee
    createNewEmployee();
  } else if (document.querySelector("#manager").checked) {
    // Call the function to create a new manager
    createNewManager();
  }
}
