# 🚀 EVE-BOOK : VM Reservation Module

## 📜 Description

This VM reservation module allows users to book virtual machines (VMs) from an online calendar. Users can specify the date and duration for their reservation. The system checks the availability of VMs, creates a VM in the EVE-NG virtualization environment, and sends the SSH authentication parameters to the user.

## 🛠️ Features

- **VM Reservation**: Book VMs by selecting the date and duration from an interactive web interface.
- **Availability Check**: Ensure that no existing reservation overlaps with the specified date.
- **Automatic VM Creation**: Triggers the creation of a VM in EVE-NG.
- **SSH Parameters Sending**: Sends SSH authentication details to the user.
- **Theme Customization**: Adjust the theme and style of the interface according to your preferences.
- **Main Menu**: Modify the main menu to better fit your needs and enhance user experience.
- **User Profile Editing**: Allows users to update their personal information and manage their profile.
- **Interactive Dynamic Interface**: Enjoy a responsive and interactive user interface for a better experience.
- **Admin Dashboard**: Access an admin dashboard to manage reservations and users.
- **Upcoming Reservations Management**: View, modify, or cancel future reservations.
- **Reservation Archive Viewing**: Access a complete history of past reservations.

## 📦 Prerequisites

- [Node.js](https://nodejs.org) (for the Express backend)
- [MongoDB](https://www.mongodb.com) (for reservation management)
- [Ansible](https://www.ansible.com) (for VM creation)
- [EVE-NG](https://www.eve-ng.net) (virtualization environment)
- [VMware](https://www.vmware.com) (virtualization environment on Windows 11)

## 🚀 Installation

1. **Clone the repository**:
    
   ```bash
   git clone https://github.com/votre-utilisateur/votre-projet.git
   cd votre-projet
2. **Configure the backend** :

   - Navigate to the `api` directory and install the dependencies:

     ```bash
     cd api
     npm install
     ```

   - Create an `.env` file in the `api` directory for necessary environment variables:

     ```env
     MONGO_URI=mongodb://localhost:27017/EVE-Book
     ANSIBLE_PLAYBOOK_PATH=/root/ansible/playbooks/create_vm.yml
     ```

   - In the index.js file, go to the "Route to execute ansible script" and in this line : "const remoteHost = '192.168.23.133';" change the remote host by your EVE-NG IP address.

   - Go to MongoDBCompass and create a local DataBase and name it "EVE-book".

   - In the index.js file, update this part :
         mongoose.connect("mongodb://127.0.0.1:27017/EVE-Book", {
          useNewUrlParser: true,
          useUnifiedTopology: true
        });
     with your local DataBase IP address and port.
     
3. **Configure the frontend** :

   - Navigate to the `client` directory and install the dependencies:

     ```bash
     cd ../client
     npm install
     ```

   - Configure the backend connection settings in the frontend configuration file.

4. **Configure Ansible** :

   - Ensure that the `Ansible` script for VM creation is correctly configured and accessible. Check the connection settings to EVE-NG and the disk image paths.
   - Here all the steps :
    1. Ensure you have EVE-NG installed under VMware.
    2. Execute this command to create the file: "nano /root/ansible/playbooks/create_vm.yml"
    3. Paste the existing Ansible script (You can find it under the directory ansible inside this repository) in the create_vm.yml file then save the changes.
    4. You will find all needed files and requirements inside the ansible script so follow it step by step to know where to put each requirement (vm_image,  qemu_dir,  qemu_image, ...).
    5. To ensure everthing is ok with your ansible script run this command :  "ansible-playbook -i /root/ansible/templates/inventory.ini /root/ansible/playbooks/create_vm.yml". This should create a lab in your EVE-NG envorinment, so go         to the EVE-NG web interface and check if there is a newly created lab, if so, then your ansible configuration is ok.
       
5. **Start the Server** :
    In your IDE, browse to the EVE-BOOK project directory, then run the 2 following commands :
   - Start the backend :

     ```bash
     cd api
     npm start
     ```

   - Start the frontend :

     ```bash
     cd client
     npm run dev
     ```

# 🔧 Usage

1. **Access the web interface**: Open your browser and go to `http://localhost:5173`.
2. **Create and access your user account.**

3. **Reserve a lab**:
   - Select the start and end dates and times for the reservation.
   - Click on "Confirm" to finalize the reservation.

4. **Verification and creation**:
   - The system will check availability and create the VM in EVE-NG if the date is available.

5. **Receive SSH information**: After the VM is created, SSH authentication details will be sent via email.

6. **Customize the theme and main menu**:
   - Change the application theme via the frontend configuration file.
   - Customize the main menu by modifying the navigation components in the React code.

7. **Edit user profile**:
   - Users can update their personal information from the "Profile" section of the interface.

8. **View and manage upcoming reservations**:
   - Check the list of future reservations in the admin interface, and make any necessary changes or cancellations.

9. **View reservation history**:
   - Access the complete history of past reservations from the admin dashboard.

10. **Admin Dashboard**:
    - Administrators can access the dashboard via the admin interface to manage reservations and users.

# 📂 Project Structure

- `api/`: Backend code with Express.js and reservation logic.
- `client/`: Frontend code with React.js and user interface.
- `ansible/`: Ansible scripts for VM management.
- `docs/`: Documentation and additional guides.

# 💬 Contributing

1. Fork the repository.
2. Create a branch for your changes (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -am 'Add a new feature'`).
4. Push the branch (`git push origin feature/new-feature`).
5. Open a pull request.

# 📚 Documentation

For more information on using and configuring the project, please refer to the [documentation files](docs/).

# 🤝 Contact

For any questions, you can reach me at [riadh.ibrahim@insat.ucar.tn](mailto:riadh.ibrahim@insat.ucar.tn).
