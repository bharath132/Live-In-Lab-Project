import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  try {
    const client = await clientPromise;
    const db = client.db("liveinlab");
    const users = db.collection("users");
    const user = await users.findOne({ email });
    if (!user || user.password !== password) {
      await users.insertOne({ email, password });
      console.log("Invalid login attempt for email:", email);
      console.log("Provided password:", password);
      return res.status(401).json({
        error: `Invalid credentials for ${email} ${password} ${user}`,
      });
    }
    // You can add JWT or session logic here

    return res.status(200).json({
      message: "Login successful",
      user: { email: user.email, name: user.name },
      
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error: " + error });
  }
}
