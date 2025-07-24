export default function PostCards({ data }) {
  return (
    <div className="p-6">
      <div className="space-y-1">
        <p className="font-bold text-xl">Recently Shared Items</p>
        <p className="text-gray-400">
          Discover amazing items shared by our community members
        </p>
      </div>

      <div className="grid grid-col-4">
        <div className="border border-black col-span-1">
          <div>
            <img src="" alt="" />
            <h3></h3>
            <p>Description</p>
            <div></div>
          </div>
        </div>

        <div className="border border-black col-span-1">
          <div>
            <p>1</p>
          </div>
        </div>

        <div className="border border-black col-span-1">
          <div>
            <p>1</p>
          </div>
        </div>

        <div className="border border-black col-span-1">
          <div>
            <p>1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
