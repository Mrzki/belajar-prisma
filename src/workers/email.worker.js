import { Worker } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker(
  "email",
  async (job) => {
    if (job.name === "send-welcome-email") {
      const { email, name } = job.data;
      console.log(`📧 Mengirim welcome email ke: ${email}`);
      console.log(`   Halo ${name}, selamat datang!`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`✅ Email berhasil dikirim ke: ${email}`);
    }

    if (job.name === "send-reset-password") {
      const { email, token } = job.data;
      console.log(`📧 Mengirim reset password email ke: ${email}`);
      console.log(`   Token: ${token}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log(`✅ Reset password email terkirim ke: ${email}`);
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} selesai!`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job.id} gagal:`, err.message);
});

export default worker;
