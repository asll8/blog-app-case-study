// ImgBB API Key
const apiKey = "3254b8858187ccd1f7865af8284ea0dc";

// Upload Image to ImgBB
async function uploadToImgBB(base64Image) {
  const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
  const formData = new FormData();
  formData.append("image", base64Image);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    console.log("ImgBB Upload Response:", data);
    return data.data.url; // Return uploaded image URL
  } catch (error) {
    console.error("Error uploading to ImgBB:", error);
    return null;
  }
}

// Handle Device Ready
document.addEventListener("deviceready", () => {
  console.log("Device is ready and plugins are available.");
}, false);

let capturedImage = "";
document.getElementById("capture-image").addEventListener("click", () => {
  if (!navigator.camera) {
    alert("Camera is not available. Please ensure the app is running on a device.");
    return;
  }

  navigator.camera.getPicture(
    (imageData) => {
      capturedImage = `data:image/jpeg;base64,${imageData}`;
      const imagePreview = document.getElementById("image-preview");
      imagePreview.src = capturedImage;
      imagePreview.style.display = "block";
      console.log("Image captured and preview updated.");
    },
    (error) => {
      console.error("Camera error:", error);
      alert(`Failed to capture image: ${error}`);
    },
    {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
    }
  );
});

// Create Blog Post
async function createBlogPost(title, description, imageUrl) {
  const apiUrl = "https://api.jsonbin.io/v3/b/67404cfaacd3cb34a8acbc6d";
  const masterKey = "$2a$10$EzXLfm23nVvDZV3uew6zuOCLbTe13tXdio.wSUXdzCxipeW44GAb2";

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey,
        "Cache-Control": "no-cache",
      },
    });

    const data = await response.json();
    const existingPosts = data.record?.blog || [];

    const newPost = {
      id: Date.now(),
      title,
      description,
      image: imageUrl,
    };
    const updatedPosts = [...existingPosts, newPost];

    const updateResponse = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey,
      },
      body: JSON.stringify({ record: { blog: updatedPosts } }),
    });

    if (updateResponse.ok) {
      console.log("Blog post created successfully!");
      alert("Blog post created successfully!");
    } else {
      console.error("Failed to update blog posts:", await updateResponse.text());
    }
  } catch (error) {
    console.error("Error creating blog post:", error);
  }
}

// Fetch Blog Posts
async function fetchBlogPosts() {
  const apiUrl = "https://api.jsonbin.io/v3/b/67404cfaacd3cb34a8acbc6d/latest";
  const masterKey = "$2a$10$EzXLfm23nVvDZV3uew6zuOCLbTe13tXdio.wSUXdzCxipeW44GAb2";

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey,
        "Cache-Control": "no-cache",
      },
    });

    const data = await response.json();
    const posts = data.record?.blog || [];
    const outputElement = document.getElementById("output");
    outputElement.innerHTML = "";

    if (posts.length > 0) {
      posts.forEach((post) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <strong>${post.title}</strong>
          <p>${post.description}</p>
          ${post.image ? `<img src="${post.image}" alt="Post Image" style="max-width: 200px;">` : ""}
        `;
        outputElement.appendChild(listItem);
      });
    } else {
      outputElement.innerHTML = "<li>No blog posts available...</li>";
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error);
  }
}

// Form Submission
document.getElementById("post-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;

  if (!capturedImage) {
    alert("Please capture an image first!");
    return;
  }

  const imageUrl = await uploadToImgBB(capturedImage);

  if (imageUrl) {
    await createBlogPost(title, description, imageUrl);
    fetchBlogPosts();
    e.target.reset();
    document.getElementById("image-preview").style.display = "none";
    capturedImage = "";
  } else {
    alert("Failed to upload the image.");
  }
});


// Fetch on Button Click
document.getElementById("fetch-data").addEventListener("click", fetchBlogPosts);
