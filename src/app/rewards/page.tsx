'use client'
import { useState, useEffect } from 'react'
import { Coins, ArrowUpRight, ArrowDownRight, Gift, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

export default function RewardsPage() {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [rewards, setRewards] = useState([])
  const [loading, setLoading] = useState(true)

  const getUserEmail = () => localStorage.getItem('userEmail') || 'demo@example.com'

  const addTransaction = (type, amount, description) => {
    const email = getUserEmail()
    const newTx = {
      id: Date.now(),
      email,
      type,
      amount,
      description,
      date: new Date().toLocaleString()
    }

    const txList = JSON.parse(localStorage.getItem('transactions') || '[]')
    txList.push(newTx)
    localStorage.setItem('transactions', JSON.stringify(txList))

    return newTx
  }

  const refreshData = () => {
    const email = getUserEmail()
    const txList = JSON.parse(localStorage.getItem('transactions') || '[]')
    const userTx = txList.filter(tx => tx.email === email)
    setTransactions(userTx)

    const newBalance = userTx.reduce((acc, tx) => {
      return tx.type.startsWith('earned') ? acc + tx.amount : acc - tx.amount
    }, 0)

    setBalance(Math.max(newBalance, 0))
  }

  useEffect(() => {
    const email = getUserEmail()

    // Simulate 1 earned_report if user has no transactions (for demo)
    const txList = JSON.parse(localStorage.getItem('transactions') || '[]')
    const userTx = txList.filter(tx => tx.email === email)

    if (userTx.length === 0) {
      const demoTx = {
        id: Date.now(),
        email,
        type: 'earned_report',
        amount: 10,
        description: 'Report submitted: Plastic',
        date: new Date().toLocaleString()
      }
      txList.push(demoTx)
      localStorage.setItem('transactions', JSON.stringify(txList))
    }

    setTransactions(userTx)
    const calculatedBalance = userTx.reduce((acc, tx) =>
      tx.type.startsWith('earned') ? acc + tx.amount : acc - tx.amount
    , 0)

    setBalance(Math.max(calculatedBalance, 0))

    // Dummy rewards list
    setRewards([
      { id: 1, name: "Eco Bottle", cost: 30, description: "Reusable eco bottle", collectionInfo: "Collect from booth A" },
      { id: 2, name: "Organic Bag", cost: 50, description: "Stylish cloth bag", collectionInfo: "Collect from booth B" },
      { id: 0, name: "Redeem All", cost: 0, description: null, collectionInfo: "Get all points converted" },
    ])

    setLoading(false)
  }, [])

  const handleRedeemReward = (rewardId) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (!reward || reward.cost > balance) {
      toast.error('Insufficient balance or invalid reward.')
      return
    }

    addTransaction('redeemed', reward.cost, `Redeemed ${reward.name}`)
    toast.success(`You have successfully redeemed: ${reward.name}`)
    refreshData()
  }

  const handleRedeemAllPoints = () => {
    if (balance === 0) {
      toast.error('No points to redeem.')
      return
    }

    addTransaction('redeemed', balance, 'Redeemed all points')
    toast.success('You redeemed all your points!')
    refreshData()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-gray-600" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Rewards</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-between h-full border-l-4 border-green-500 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Reward Balance</h2>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <Coins className="w-10 h-10 mr-3 text-green-500" />
            <div>
              <span className="text-4xl font-bold text-green-500">{balance}</span>
              <p className="text-sm text-gray-500">Available Points</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center">
                    {tx.type.startsWith('earned') ? (
                      <ArrowUpRight className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{tx.description}</p>
                      <p className="text-sm text-gray-500">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${tx.type.startsWith('earned') ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type.startsWith('earned') ? '+' : '-'}{tx.amount}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No transactions yet</div>
            )}
          </div>
        </div>

        {/* Available Rewards */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Rewards</h2>
          <div className="space-y-4">
            {rewards.length > 0 ? (
              rewards.map(reward => (
                <div key={reward.id} className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{reward.name}</h3>
                    <span className="text-green-500 font-semibold">{reward.cost} points</span>
                  </div>
                  <p className="text-gray-600 mb-2">{reward.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{reward.collectionInfo}</p>
                  {reward.id === 0 ? (
                    <Button onClick={handleRedeemAllPoints} className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={balance === 0}>
                      <Gift className="w-4 h-4 mr-2" /> Redeem All Points
                    </Button>
                  ) : (
                    <Button onClick={() => handleRedeemReward(reward.id)} className="w-full bg-green-500 hover:bg-green-600 text-white" disabled={balance < reward.cost}>
                      <Gift className="w-4 h-4 mr-2" /> Redeem Reward
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-6 w-6 text-yellow-400 mr-3" />
                  <p className="text-yellow-700">No rewards available at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
