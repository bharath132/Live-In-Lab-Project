'use client'
import { useState, useEffect } from 'react'
import { Loader, Award, User, Trophy, Crown } from 'lucide-react'

type Reward = {
  userId: number
  userName: string
  points: number
  level: number
}

export default function LeaderboardPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('')

  useEffect(() => {
    const email = localStorage.getItem('userEmail') || 'demo@example.com'
    setCurrentUserEmail(email)

    // Simulate users and their rewards
    const dummyUsers = [
      { userId: 1, userName: 'Arun K', email: 'arun@example.com' },
      { userId: 2, userName: 'Bhavya S', email: 'bhavya@example.com' },
      { userId: 3, userName: 'Chandru M', email: 'chandru@example.com' },
      { userId: 4, userName: 'You', email: email },
    ]

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')

    const userRewards: Reward[] = dummyUsers.map(user => {
      const userTx = transactions.filter((tx: any) => tx.email === user.email)
      const points = userTx.reduce((acc: number, tx: any) =>
        tx.type.startsWith('earned') ? acc + tx.amount : acc - tx.amount
      , 0)
      const level = Math.floor(points / 50) + 1
      return {
        userId: user.userId,
        userName: user.userName,
        points: Math.max(points, 0),
        level
      }
    })

    // Sort by points descending
    const sorted = userRewards.sort((a, b) => b.points - a.points)
    setRewards(sorted)
    setLoading(false)
  }, [])

  return (
    <div className="">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Leaderboard</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin h-8 w-8 text-gray-600" />
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex justify-between items-center text-white">
                <Trophy className="h-10 w-10" />
                <span className="text-2xl font-bold">Top Performers</span>
                <Award className="h-10 w-10" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward, index) => (
                    <tr
                      key={reward.userId}
                      className={`${reward.userName === 'You' ? 'bg-indigo-50' : ''} hover:bg-gray-50 transition-colors duration-150 ease-in-out`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <Crown
                              className={`h-6 w-6 ${
                                index === 0
                                  ? 'text-yellow-400'
                                  : index === 1
                                  ? 'text-gray-400'
                                  : 'text-yellow-600'
                              }`}
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <User className="h-full w-full rounded-full bg-gray-200 text-gray-500 p-2" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{reward.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-indigo-500 mr-2" />
                          <div className="text-sm font-semibold text-gray-900">{reward.points}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Level {reward.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
