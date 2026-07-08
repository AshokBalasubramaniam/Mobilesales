const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
    {Icon && <Icon className="size-10 text-gray-400" />}
    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
    {description && <p className="max-w-sm text-sm text-gray-500">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
