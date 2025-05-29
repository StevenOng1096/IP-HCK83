export default function MovieCard() {
  return (
    <div
      className="movie-card-wrapper"
      style={{ width: "200px", margin: "10px" }}
    >
      <div className="card h-100">
        <img
          src={"https://via.placeholder.com/200x300.png?text=Movie+Poster"}
          className="card-img-top"
          alt="movie-img"
          style={{ height: "300px", objectFit: "cover" }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">title</h5>
          <div>
            <p className="card-text">Released year: CreatedAt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
