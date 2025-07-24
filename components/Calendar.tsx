export default function Calendar({ slots }) {
  return (
    <div className="space-y-4">
      {slots.map(slot => (
        <div key={slot.id} className="border p-4 rounded-lg hover:bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">{new Date(slot.startTime).toLocaleString()}</h3>
              <p className="text-sm text-gray-500">{slot.duration} minutes</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Réserver
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
