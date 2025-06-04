import { useEffect } from "react";
import MainNavigation from "../../components/MainNavigation";

// import images
import landingImage from "../../img/landing-image.png"; // replace with your actual image path
import logo from "../../img/logo.svg"; // replace with your actual logo path

export default function HomePage() {
	//   useEffect(() => {
	//     fetch("/api/")
	//       .then((res) => res.text())
	//       .then((data) => {
	//         console.log("API Response:", data);
	//       })
	//       .catch((err) => {
	//         console.error("API call failed:", err);
	//       });
	//   }, []);

	return (
		<>
			{/* Custom CSS for enhanced styling */}
			<style jsx>{`
				.hero-gradient {
					background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
				}
				.section-gradient {
					background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
				}
				.card-hover {
					transition: all 0.3s ease;
				}
				.card-hover:hover {
					transform: translateY(-5px);
					box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
				}
				.step-circle {
					background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
					color: white;
					transition: all 0.3s ease;
				}
				.step-circle:hover {
					transform: scale(1.1);
					box-shadow: 0 8px 20px rgba(108, 117, 125, 0.3);
				}
				.btn-elegant {
					background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
					border: none;
					padding: 12px 30px;
					font-weight: 500;
					letter-spacing: 0.5px;
                    color: white;
					transition: all 0.3s ease;
				}
				.btn-elegant:hover {
					background: linear-gradient(135deg, #495057 0%, #343a40 100%);
					transform: translateY(-2px);
                    color: white;
					box-shadow: 0 8px 20px rgba(0,0,0,0.2);
				}
				.testimonial-card {
					border: none;
					transition: all 0.3s ease;
					background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
				}
				.testimonial-card:hover {
					transform: translateY(-8px);
					box-shadow: 0 15px 35px rgba(0,0,0,0.1) !important;
				}
				.section-title {
					position: relative;
					display: inline-block;
					margin-bottom: 2rem;
				}
				.section-title::after {
					content: '';
					position: absolute;
					bottom: -10px;
					left: 50%;
					transform: translateX(-50%);
					width: 60px;
					height: 3px;
					background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
					border-radius: 2px;
				}
				.hero-content {
					animation: fadeInUp 1s ease-out;
				}
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(30px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>

			<MainNavigation />

			{/* Hero Section */}
			<section className="hero-gradient py-5">
				<div className="container py-5">
					<div className="row align-items-center min-vh-75">
						{/* Image */}
						<div className="col-lg-6 mb-4 mb-lg-0">
							<div className="position-relative">
								<img 
									src={landingImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"} 
									className="img-fluid rounded-3 shadow-lg w-100" 
									alt="Peaceful columbarium setting" 
									style={{objectFit: 'cover', height: '400px'}}
								/>
								<div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-10 rounded-3"></div>
							</div>
						</div>

						{/* Content */}
						<div className="col-lg-6 ps-lg-5 hero-content">
							<div className="d-flex align-items-center mb-4">
								<img 
									src={logo || "https://via.placeholder.com/60x60/6c757d/ffffff?text=AL"} 
									alt="AfterLife logo" 
									className="me-3 rounded-circle shadow-sm" 
									style={{width: '60px', height: '60px'}}
								/>
								<div>
									<h1 className="display-4 fw-bold text-dark mb-0">AfterLife</h1>
									<p className="text-muted mb-0">Dignified Digital Remembrance</p>
								</div>
							</div>

							<p className="text-dark mb-4 lh-lg">
								Welcome to AfterLife, a dignified digital space for remembrance and columbarium services. 
								Whether you're visiting, making arrangements, or managing records, we are here to assist 
								with compassion and ease.
							</p>
							
							<div className="d-flex gap-3 flex-wrap">
								<button className="btn btn-elegant btn-lg rounded-pill px-4">
									ℹ️ About Us
								</button>
								<button className="btn btn-elegant btn-lg rounded-pill px-4">
									Get Started
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* About Section */}
			<section className="section-gradient py-5">
				<div className="container py-5">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold section-title text-dark">About the Columbarium</h2>
					</div>
					
					<div className="row justify-content-center">
						<div className="col-lg-10">
							<div className="row g-4">
								<div className="col-md-6">
									<div className="h-100 p-4">
										<div className="d-flex align-items-center mb-3">
											<div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
												<i className="fas fa-dove text-secondary"></i>
											</div>
											<h4 className="fw-semibold mb-0">Peaceful Environment</h4>
										</div>
										<p className="text-muted lh-lg">
											Nestled in a peaceful and respectful environment, AfterLife Columbarium offers 
											a dignified final resting place for loved ones. Designed with tranquility in mind.
										</p>
									</div>
								</div>
								
								<div className="col-md-6">
									<div className="h-100 p-4">
										<div className="d-flex align-items-center mb-3">
											<div className="bg-secondary bg-opacity-10 p-3 rounded-circle me-3">
												<i className="fas fa-heart text-secondary"></i>
											</div>
											<h4 className="fw-semibold mb-0">Modern Facilities</h4>
										</div>
										<p className="text-muted lh-lg">
											Our modern facilities blend serenity with tradition, providing families a calm 
											space for reflection, remembrance, and connection with digital management tools.
										</p>
									</div>
								</div>
							</div>
							
							<div className="text-center mt-5">
								<button className="btn btn-elegant btn-lg rounded-pill px-5">
									Learn More About Our Mission
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Getting Started Section */}
			<section className="py-5 bg-white">
				<div className="container py-5">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold section-title text-dark">Getting Started</h2>
						<p className="text-muted mt-3">Three simple steps to begin your journey with us</p>
					</div>
					
					<div className="row g-4 justify-content-center">
						{/* Step 1 */}
						<div className="col-lg-4 col-md-6">
							<div className="text-center h-100">
								<div className="step-circle d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4" 
									 style={{ width: "120px", height: "120px", fontSize: "3rem" }}>
									👤
								</div>
								<h4 className="fw-bold mb-3">Create an Account</h4>
								<p className="text-muted lh-lg px-3">
									Register with us to access our digital platform and begin your personalized experience.
								</p>
							</div>
						</div>

						{/* Step 2 */}
						<div className="col-lg-4 col-md-6">
							<div className="text-center h-100">
								<div className="step-circle d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4" 
									 style={{ width: "120px", height: "120px", fontSize: "3rem" }}>
									🔍
								</div>
								<h4 className="fw-bold mb-3">Search Available Niches</h4>
								<p className="text-muted lh-lg px-3">
									Browse our available spaces and find the perfect resting place that meets your needs.
								</p>
							</div>
						</div>

						{/* Step 3 */}
						<div className="col-lg-4 col-md-6">
							<div className="text-center h-100">
								<div className="step-circle d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4" 
									 style={{ width: "120px", height: "120px", fontSize: "3rem" }}>
									💳
								</div>
								<h4 className="fw-bold mb-3">Make Booking & Payment</h4>
								<p className="text-muted lh-lg px-3">
									Complete your reservation with her secure payment system and finalize arrangements.
								</p>
							</div>
						</div>
					</div>

					<div className="text-center mt-5">
						<button className="btn btn-elegant btn-lg rounded-pill px-5">
							🚀 Apply Now!
						</button>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="section-gradient py-5">
				<div className="container py-5">
					<div className="text-center mb-5">
						<h2 className="display-5 fw-bold section-title text-dark">What Families Say</h2>
						<p className="text-muted mt-3">Hear from those who have trusted us with their loved ones</p>
					</div>
					
					<div className="row g-4">
						{/* Testimonial 1 */}
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-card card h-100 p-4 card-hover shadow-sm">
								<div className="card-body">
									<div className="d-flex align-items-center mb-4">
										<img 
											src="https://i.pravatar.cc/60?img=32" 
											alt="Elaine Tan" 
											className="rounded-circle me-3 shadow-sm" 
											width="60" 
											height="60" 
										/>
										<div>
											<h5 className="fw-bold mb-1">Elaine Tan</h5>
											<p className="text-muted small mb-0">Daughter of Mr. Tan</p>
										</div>
									</div>
									<blockquote className="blockquote">
										<p className="fst-italic text-dark lh-lg">
											"The booking process was seamless, and the staff were incredibly helpful. 
											AfterLife gave my family peace of mind during a tough time."
										</p>
									</blockquote>
									<div className="text-warning">
										⭐⭐⭐⭐⭐
									</div>
								</div>
							</div>
						</div>

						{/* Testimonial 2 */}
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-card card h-100 p-4 card-hover shadow-sm">
								<div className="card-body">
									<div className="d-flex align-items-center mb-4">
										<img 
											src="https://i.pravatar.cc/60?img=12" 
											alt="Raymond Lim" 
											className="rounded-circle me-3 shadow-sm" 
											width="60" 
											height="60" 
										/>
										<div>
											<h5 className="fw-bold mb-1">Raymond Lim</h5>
											<p className="text-muted small mb-0">Family Representative</p>
										</div>
									</div>
									<blockquote className="blockquote">
										<p className="fst-italic text-dark lh-lg">
											"We were able to browse and select a niche online, which saved us so much time. 
											Everything was clear and respectful."
										</p>
									</blockquote>
									<div className="text-warning">
										⭐⭐⭐⭐⭐
									</div>
								</div>
							</div>
						</div>

						{/* Testimonial 3 */}
						<div className="col-lg-4 col-md-6">
							<div className="testimonial-card card h-100 p-4 card-hover shadow-sm">
								<div className="card-body">
									<div className="d-flex align-items-center mb-4">
										<img 
											src="https://i.pravatar.cc/60?img=8" 
											alt="Amira Yusof" 
											className="rounded-circle me-3 shadow-sm" 
											width="60" 
											height="60" 
										/>
										<div>
											<h5 className="fw-bold mb-1">Amira Yusof</h5>
											<p className="text-muted small mb-0">Returning Visitor</p>
										</div>
									</div>
									<blockquote className="blockquote">
										<p className="fst-italic text-dark lh-lg">
											"Beautifully designed and easy to use. I was able to pay respects and manage 
											bookings without needing to call anyone."
										</p>
									</blockquote>
									<div className="text-warning">
										⭐⭐⭐⭐⭐
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-dark text-light py-5">
				<div className="container">
					<div className="row">
						<div className="col-md-6">
							<div className="d-flex align-items-center mb-3">
								<img 
									src={logo || "https://via.placeholder.com/40x40/ffffff/6c757d?text=AL"} 
									alt="AfterLife logo" 
									className="me-3 rounded-circle" 
									style={{width: '40px', height: '40px'}}
								/>
								<h5 className="fw-bold mb-0">AfterLife</h5>
							</div>
							<p className="text-light">
								Providing dignified digital remembrance services with compassion and respect.
							</p>
						</div>
						<div className="col-md-6 text-md-end">
							<p className="text-light mb-2">© 2024 AfterLife. All rights reserved.</p>
							<p className="text-light small">
								Designed with love and respect for families in their time of need.
							</p>
						</div>
					</div>
				</div>
			</footer>
		</>
	);
}