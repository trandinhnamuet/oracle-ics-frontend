export default function AvatarTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Avatar Upload</h1>
      <p>Trang này để test upload avatar. Backend cần được khởi động với:</p>
      <code className="block bg-gray-100 p-4 rounded">
        cd oracle-ics-backend<br/>
        npm run migration:run<br/>
        npm run start:dev
      </code>
      <p className="mt-4">
        Sau đó có thể test upload avatar ở trang Profile.
      </p>
    </div>
  )
}