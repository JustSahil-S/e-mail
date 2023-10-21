document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () =>compose_email(false));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(isReply, email) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-view').style.display = 'none';

  // Clear out composition fields
  if (isReply==false) {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = ''; 
  } 
  else {
    document.querySelector('#compose-recipients').value = email.sender;
    if (email.subject.substr(0,3 )!= "Re:") {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`}
    else {document.querySelector('#compose-subject').value = email.subject};
    document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote: "${email.body}"`; 
  };
  document.querySelector("#compose-form").addEventListener('submit', (event) => {
    event.stopImmediatePropagation();
    fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value,
    })
  })
.then(response => response.json())
.then(result => {console.log(result)})
})};




function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`).then(response => response.json()).then(list => {
    console.log(list);
    list.forEach(email =>{
      var element = document.createElement("div");
      if (email.read == true & mailbox != "sent") {
        element.style.cssText = "display:flex; border:1px solid gray;background-color: #DBDBDB;border-radius:5px; padding-left:10px; font-size:18px"
        console.log("Read Email")
      }
      else {
        element.style.cssText = "display:flex; border:1px solid black;border-radius:5px;padding-left:10px; font-size:18px"
        console.log("Unread Email")
      }
      if (mailbox == "sent"){
        element.innerHTML = `<p>To: <b>${email.recipients}</b></p> <p style="padding-left:20px; margin-bottom:0px; text-align:center">Subject: ${email.subject} </p> <p style="padding-left:60px; float:right; position:relative; display:inline-block">${email.timestamp}</p>`;
      }
      else {element.innerHTML = `<p>Sent by: <b>${email.sender}</b></p> <p style="padding-left:20px; margine-bottom:0px; text-align:center">Subject: ${email.subject} </p> <p style="padding-left:60px; float:right; position:relative; display:inline-block">${email.timestamp}</p>`;
    };
      element.addEventListener('click', () => read_mail(email.id, mailbox == "sent"));
      console.log(email.subject);
      document.querySelector("#emails-view").appendChild(element);
  })})
}

function read_mail(id, isSentMailbox) {
  document.querySelector("#emails-view").style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  fetch(`/emails/${id}`).then(response => response.json()).then(email => {
    console.log(email);
    var element = document.createElement("div");
    //element.innerHTML = `<p>From: ${email.sender}</p><p>To: ${email.recipients}</p><p>Date: ${email.timestamp}</p> <p>Subject: ${email.subject}</p><p>${email.body}</p>`
    document.querySelector("#read-view").innerHTML= `<p>From: ${email.sender}</p><p>To: ${email.recipients}</p><p>Date: ${email.timestamp}</p> <p>Subject: ${email.subject}</p><p>${email.body}</p>` ;
    if (!isSentMailbox) {
      var reply = document.createElement("div");
      reply.innerHTML = "<button>Reply</button>"
      reply.addEventListener("click", () => compose_email(true, email));
      document.querySelector("#read-view").append(reply);
  }
  if (!isSentMailbox) {
    if (email.archived == false) {
    element.innerHTML = "<button>Archive</button>"
    element.addEventListener("click", () => archive(email.id, false));
    document.querySelector("#read-view").append(element);}
    else {
    element.innerHTML = "<button>Unarchive</button>"
    element.addEventListener("click", () => archive(email.id, true));
    document.querySelector("#read-view").append(element);}
  }
    //document.querySelector("#archive").addEventListener('click', () => archive(email.id));
    document.querySelector('#read-view').style.display = 'block';
  });
  fetch(`/emails/${id}`, {method: 'PUT', body: JSON.stringify({
    read: true
  })})
}
function archive(id, isArchived) {
  if (isArchived == false) {
  fetch(`/emails/${id}`, {method: 'PUT', body: JSON.stringify({
    archived: true
  })}).then(load_mailbox('inbox'))}
  if (isArchived == true) {
    fetch(`/emails/${id}`, {method: 'PUT', body: JSON.stringify({
      archived: false
    })}).then(load_mailbox('inbox'))}

}