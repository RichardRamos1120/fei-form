import type { FirefighterInfo as FirefighterInfoType } from '../types'

interface Props {
  data: FirefighterInfoType
  updateField: (field: string, value: string) => void
}

export default function FirefighterInfo({ data, updateField }: Props) {
  return (
    <div className="bg-white rounded-lg p-5 mb-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-4 text-red-700">Firefighter Information</h2>
      <div className="bg-yellow-50 border border-yellow-400 p-4 rounded mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> If you don't know specific information for any field below, please select or enter "Information Unavailable"
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="firefighterName" className="block mb-1 font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="firefighterName"
            value={data.firefighterName}
            onChange={(e) => updateField('firefighterName', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
            required
          />
        </div>

        <div>
          <label htmlFor="firefighterId" className="block mb-1 font-medium text-gray-700">
            Firefighter ID *
          </label>
          <input
            type="text"
            id="firefighterId"
            value={data.firefighterId}
            onChange={(e) => updateField('firefighterId', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
            required
          />
        </div>

        <div>
          <label htmlFor="rank" className="block mb-1 font-medium text-gray-700">
            Rank/Position
          </label>
          <input
            type="text"
            id="rank"
            value={data.rank || ''}
            onChange={(e) => updateField('rank', e.target.value)}
            placeholder="e.g., Captain, Engineer, Firefighter"
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
          />
        </div>

        <div>
          <label htmlFor="department" className="block mb-1 font-medium text-gray-700">
            Department/Station
          </label>
          <input
            type="text"
            id="department"
            value={data.department || ''}
            onChange={(e) => updateField('department', e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded focus:outline-none focus:border-red-700"
          />
        </div>
      </div>
    </div>
  )
}