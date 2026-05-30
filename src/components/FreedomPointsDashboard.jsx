import { useState } from 'react';

export default function FreedomPointsDashboard() {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childPassword, setChildPassword] = useState('');
  const [starterPoints, setStarterPoints] = useState('0');
  const [childAvatar, setChildAvatar] = useState('🚀');

  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [taskPoints, setTaskPoints] = useState('');

  const [rewards, setRewards] = useState([]);
  const [rewardName, setRewardName] = useState('');
  const [rewardCost, setRewardCost] = useState('');

  // 🔐 AUTH SYSTEM
  const [showAuth, setShowAuth] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [pendingJob, setPendingJob] = useState(null);

  // FIX #1: Safely get active child
  const activeChild = selectedChild !== null 
    ? selectedChild 
    : (children.length > 0 ? children[0] : null);

  // FIX #2: Get the actual child from array for auth validation
  const getChildFromArray = (childToFind) => {
    if (!childToFind) return null;
    return children.find(c => c.name === childToFind.name);
  };

  // ---------------- ADD CHILD ----------------
  const addChild = () => {
    if (!childName.trim()) {
      alert('Please enter a child name');
      return;
    }

    // FIX #3: Validate starter points
    const points = Number(starterPoints);
    if (isNaN(points) || points < 0) {
      alert('Please enter a valid number for starter points');
      return;
    }

    const newChild = {
      name: childName,
      age: childAge || 'N/A',
      password: childPassword || '1234',
      points: points,
      avatar: childAvatar,
      mood: 'Ready to grow ✨',
      streak: 0,
    };

    setChildren((prev) => [...prev, newChild]);
    setSelectedChild(newChild);

    setChildName('');
    setChildAge('');
    setChildPassword('');
    setStarterPoints('0');
    setChildAvatar('🚀');
  };

  // ---------------- AUTH ----------------
  const handleAuth = () => {
    if (!activeChild) {
      setShowAuth(false);
      setAuthInput('');
      setPendingJob(null);
      return;
    }

    // FIX #4: Get fresh child from array for password verification
    const childFromArray = getChildFromArray(activeChild);
    if (!childFromArray) {
      setShowAuth(false);
      setAuthInput('');
      setPendingJob(null);
      return;
    }

    const ok = authInput === childFromArray.password;

    if (ok && pendingJob) {
      pendingJob();
    } else if (!ok) {
      alert('Incorrect password');
    }

    setShowAuth(false);
    setAuthInput('');
    setPendingJob(null);
  };

  // Handle Enter key in auth input
  const handleAuthKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  // FIX #5: Check if can add task/reward
  const canAddTask = () => {
    if (!activeChild) {
      alert('Please add a child first');
      return false;
    }
    if (!taskName.trim()) {
      alert('Please enter a task name');
      return false;
    }
    if (!taskPoints || isNaN(Number(taskPoints))) {
      alert('Please enter valid points');
      return false;
    }
    return true;
  };

  const canAddReward = () => {
    if (!activeChild) {
      alert('Please add a child first');
      return false;
    }
    if (!rewardName.trim()) {
      alert('Please enter a reward name');
      return false;
    }
    if (!rewardCost || isNaN(Number(rewardCost))) {
      alert('Please enter valid cost');
      return false;
    }
    return true;
  };

  // ---------------- FIXED TASK COMPLETE (POINTS FIXED) ----------------
  const completeTask = (index) => {
    if (!activeChild) return;

    const task = tasks[index];
    if (!task) return;

    setTasks((prev) => prev.filter((_, i) => i !== index));

    setChildren((prev) =>
      prev.map((c) =>
        c.name === activeChild.name
          ? {
              ...c,
              points: (Number(c.points) || 0) + (Number(task.points) || 0),
            }
          : c
      )
    );

    // FIX #6: Update activeChild reference
    const updatedChild = children.find(c => c.name === activeChild.name);
    if (updatedChild) {
      setSelectedChild({
        ...updatedChild,
        points: (Number(updatedChild.points) || 0) + (Number(task.points) || 0),
      });
    }
  };

  // ---------------- FIXED REWARD UNLOCK ----------------
  const unlockReward = (index) => {
    if (!activeChild) return;

    const reward = rewards[index];
    if (!reward) return;

    if ((Number(activeChild.points) || 0) < reward.cost) {
      alert(`Not enough points! Need ${reward.cost}, have ${activeChild.points}`);
      return;
    }

    setRewards((prev) => prev.filter((_, i) => i !== index));

    setChildren((prev) =>
      prev.map((c) =>
        c.name === activeChild.name
          ? {
              ...c,
              points: (Number(c.points) || 0) - (Number(reward.cost) || 0),
            }
          : c
      )
    );

    // FIX #6: Update activeChild reference
    const updatedChild = children.find(c => c.name === activeChild.name);
    if (updatedChild) {
      setSelectedChild({
        ...updatedChild,
        points: (Number(updatedChild.points) || 0) - (Number(reward.cost) || 0),
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070b17] text-white p-6">

      {/* AUTH POPUP */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0b1020] p-6 rounded-2xl w-80">
            <h2 className="text-xl font-bold mb-4">Enter Password</h2>

            <input
              type="password"
              value={authInput}
              onChange={(e) => setAuthInput(e.target.value)}
              onKeyPress={handleAuthKeyPress}
              autoFocus
              className="w-full p-3 rounded-xl bg-black/40 mb-4"
            />

            <button
              onClick={handleAuth}
              className="w-full bg-cyan-400 text-black rounded-xl py-2 font-bold hover:bg-cyan-300"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ADD CHILD ---------------- */}
      <div className="mb-6 p-4 bg-white/5 rounded-xl">
        <h2 className="text-xl font-bold mb-3">Add Child</h2>

        <input value={childName} onChange={e => setChildName(e.target.value)} placeholder="Name" className="p-2 bg-black/30 rounded mb-2 w-full text-white" />
        <input value={childAge} onChange={e => setChildAge(e.target.value)} placeholder="Age" className="p-2 bg-black/30 rounded mb-2 w-full text-white" />
        <input value={childPassword} onChange={e => setChildPassword(e.target.value)} placeholder="Password" className="p-2 bg-black/30 rounded mb-2 w-full text-white" />

        <input
          value={starterPoints}
          onChange={(e) => setStarterPoints(e.target.value)}
          placeholder="Starter points"
          className="p-2 bg-black/30 rounded mb-2 w-full text-white"
          type="number"
        />

        <select
          value={childAvatar}
          onChange={(e) => setChildAvatar(e.target.value)}
          className="p-2 bg-black/30 rounded mb-2 w-full text-white"
        >
          <option value="🚀">🚀 Rocket</option>
          <option value="🎮">🎮 Gamer</option>
          <option value="💻">💻 Coding</option>
          <option value="🌌">🌌 Space</option>
        </select>

        <button
          onClick={addChild}
          className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-black py-2 rounded-xl font-bold hover:shadow-lg"
        >
          + Add Child
        </button>
      </div>

      {/* CHILD SELECTOR */}
      {children.length > 0 && (
        <div className="mb-4 p-4 bg-white/5 rounded-xl">
          <h3 className="text-lg font-bold mb-2">Select Child:</h3>
          <div className="flex flex-wrap gap-2">
            {children.map((child, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedChild(child)}
                className={`px-4 py-2 rounded-xl font-bold ${
                  activeChild?.name === child.name
                    ? 'bg-cyan-400 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {child.avatar} {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show message if no child */}
      {!activeChild && (
        <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500 rounded-xl text-yellow-300">
          ⚠️ Please add a child first to get started!
        </div>
      )}

      {/* ---------------- TASKS ---------------- */}
      <h2 className="text-xl font-bold mb-2">Tasks</h2>

      <div className="flex gap-2 mb-3">
        <input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="Task" className="p-2 bg-black/30 rounded flex-1 text-white" />
        <input value={taskPoints} onChange={e => setTaskPoints(e.target.value)} placeholder="Points" className="p-2 bg-black/30 rounded w-24 text-white" type="number" />

        <button
          onClick={() => {
            if (!canAddTask()) return;

            setPendingJob(() => () => {
              setTasks((prev) => [
                ...prev,
                {
                  title: taskName,
                  points: Number(taskPoints) || 0,
                },
              ]);
              setTaskName('');
              setTaskPoints('');
            });

            setShowAuth(true);
          }}
          className="bg-cyan-400 text-black px-3 rounded font-bold hover:bg-cyan-300"
        >
          Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-white/50 mb-4">No tasks yet</p>
      ) : (
        tasks.map((t, i) => (
          <div
            key={i}
            onClick={() => completeTask(i)}
            className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded mb-2 cursor-pointer hover:bg-cyan-500/40 transition"
          >
            {t.title} <span className="text-cyan-400 font-bold">+{t.points}</span>
          </div>
        ))
      )}

      {/* ---------------- REWARDS ---------------- */}
      <h2 className="text-xl font-bold mt-6 mb-2">Rewards</h2>

      <div className="flex gap-2 mb-3">
        <input value={rewardName} onChange={e => setRewardName(e.target.value)} placeholder="Reward" className="p-2 bg-black/30 rounded flex-1 text-white" />
        <input value={rewardCost} onChange={e => setRewardCost(e.target.value)} placeholder="Cost" className="p-2 bg-black/30 rounded w-24 text-white" type="number" />

        <button
          onClick={() => {
            if (!canAddReward()) return;

            setPendingJob(() => () => {
              setRewards((prev) => [
                ...prev,
                {
                  title: rewardName,
                  cost: Number(rewardCost) || 0,
                },
              ]);
              setRewardName('');
              setRewardCost('');
            });

            setShowAuth(true);
          }}
          className="bg-purple-400 text-black px-3 rounded font-bold hover:bg-purple-300"
        >
          Add
        </button>
      </div>

      {rewards.length === 0 ? (
        <p className="text-white/50 mb-4">No rewards yet</p>
      ) : (
        rewards.map((r, i) => (
          <div
            key={i}
            onClick={() => unlockReward(i)}
            className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded mb-2 cursor-pointer hover:bg-purple-500/40 transition"
          >
            {r.title} <span className="text-purple-400 font-bold">({r.cost} FP)</span>
          </div>
        ))
      )}

      {/* ---------------- ACTIVE CHILD DISPLAY ---------------- */}
      {activeChild && (
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-500/50">
          <div className="text-5xl mb-2">{activeChild.avatar}</div>
          <h3 className="text-2xl font-bold mb-2">{activeChild.name}</h3>
          <p className="text-lg text-cyan-400 font-bold mb-1">{activeChild.points} Freedom Points</p>
          <p className="text-sm text-white/70">Age: {activeChild.age}</p>
          <p className="text-sm text-white/70">Streak: {activeChild.streak} days</p>
          <p className="text-sm text-white/70 italic">{activeChild.mood}</p>
        </div>
      )}
    </div>
  );
}
