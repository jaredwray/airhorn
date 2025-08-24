---
from: webhook@notifications.com
subject: User Profile Update
templateEngine: ejs
requiredFields: [name, age, vegetables]
headers:
  x-api-key: your-api-key-here
  x-webhook-secret: webhook-secret-123
  x-request-id: <%= new Date().getTime() %>
  content-type: application/json
---
{
  "event": "user.profile.updated",
  "timestamp": "<%= new Date().toISOString() %>",
  "user": {
    "name": "<%= name %>",
    "age": <%= age %>,
    "preferences": {
      "favoriteVegetables": [
        <% vegetables.forEach(function(veg, index) { %>
        "<%= veg %>"<% if (index < vegetables.length - 1) { %>,<% } %>
        <% }); %>
      ]
    }
  },
  "metadata": {
    "source": "profile-service",
    "version": "1.0.0"
  }
}