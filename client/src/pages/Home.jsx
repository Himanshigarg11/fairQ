import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: "⏰",
      title: "Real-Time Tracking",
      description: "Track your position and get live updates on wait times with instant notifications.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: "⚖️",
      title: "Fair Management",
      description: "Advanced algorithms ensure fairness with priority handling for emergencies and elderly.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: "📊",
      title: "Analytics & Insights", 
      description: "Complete transparency with equity scores, performance metrics, and detailed reports.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: "🎯",
      title: "Smart Scheduling",
      description: "AI-powered queue optimization reduces wait times and improves service efficiency.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Progressive web app that works offline and sends push notifications to your device.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: "🔒",
      title: "Secure & Private",
      description: "Enterprise-grade security with encrypted data and privacy-first design principles.",
      color: "from-gray-500 to-gray-600"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Users", icon: "👥" },
    { number: "1M+", label: "Tickets Processed", icon: "🎫" },
    { number: "40%", label: "Time Saved", icon: "⏱️" },
    { number: "95%", label: "Satisfaction Rate", icon: "⭐" }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Hospital Administrator",
      content: "FairQ transformed our patient experience. Wait times reduced by 40% and our satisfaction scores are at an all-time high.",
      avatar: "👩‍⚕️"
    },
    {
      name: "Michael Chen",
      role: "Bank Manager", 
      content: "The fairness algorithm eliminated queue jumping completely. Our customers love the transparency and real-time updates.",
      avatar: "👨‍💼"
    },
    {
      name: "Priya Sharma",
      role: "Government Office Head",
      content: "Citizens can now complete documents beforehand. Our efficiency improved by 60% with FairQ's smart system.",
      avatar: "👩‍💻"
    }
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ea580c' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-8">
              Welcome to the Future of Queue Management
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Waiting into
              <span className="block bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent">
                Smart Experience
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              FairQ revolutionizes queue management with fairness algorithms, 
              real-time tracking, and transparent processes that save time and eliminate frustration.
            </p>
            
            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link
                  to="/register"
                  className="group relative px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <span className="relative z-10">Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-700 to-orange-800 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-full font-semibold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-orange-600">FairQ</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our intelligent system combines cutting-edge technology with human-centered design 
              to create the most fair and efficient queue management solution available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 -z-10" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How <span className="text-orange-600">FairQ</span> Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, smart, and fair in just three steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-orange-300 to-orange-500" />
            
            {[
              {
                step: "1",
                title: "Book Online",
                description: "Reserve your spot in any queue from anywhere. Complete preparation checklists to get your Prep Integrity Token.",
                icon: "📱"
              },
              {
                step: "2", 
                title: "Track in Real-Time",
                description: "Monitor your position, get notifications, and see live updates on wait times and queue fairness metrics.",
                icon: "📊"
              },
              {
                step: "3",
                title: "Arrive & Serve", 
                description: "Scan your QR code on arrival. Our fair algorithm prioritizes based on preparation, emergency, and timing.",
                icon: "✅"
              }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="relative inline-block">
                  <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 text-3xl">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our <span className="text-orange-600">Users</span> Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from organizations transforming their operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Queue Experience?
          </h2>
          <p className="text-xl text-orange-100 mb-8 leading-relaxed">
            Join thousands of organizations already using FairQ to create better, 
            fairer experiences for everyone.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-orange-600 rounded-full font-semibold text-lg hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FQ</span>
              </div>
              <h3 className="text-2xl font-bold text-white">FairQ</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Smart & Fair Real-Time Queue Management System
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 FairQ. All rights reserved. 
            </p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Home;
